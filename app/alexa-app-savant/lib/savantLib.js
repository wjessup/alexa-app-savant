const eventAnalytics = require('./eventAnalytics');
const _ = require('lodash');
const q = require('q');

function serviceRequest(request, type, argument, argumentValue) {
  log.debug(`serviceRequest sending: ${request}`);
   let requestToSend = "";
   switch(type.toLowerCase()) {
     case "zone":
      //only pass [zone, request]
      requestToSend = [`servicerequest "${request[0]}" "" "" "" "" "${request[1]}"`];
      break;
    case "volume":
      //only pass [zone, request]
      requestToSend = [`servicerequest "${request[0]}" "" "" "" "" "SetVolume" "VolumeValue" "${argumentValue[0]}"`];
      break;
    case "custom":
      //only pass request and assume it's in dining generic
      requestToSend = [`servicerequest "${customWorkflowScope[0]}" "${customWorkflowScope[1]}" "" "1" "SVC_GEN_GENERIC" "${request[0]}"`];
      break;
    case "lighting":
      //pass zone and %
      requestToSend = [`servicerequest "${request[0]}" "" "" "" "SVC_ENV_LIGHTING" "__RoomSetBrightness" "BrightnessLevel" "${argumentValue[0]}"`];
      break;
    case "full":
      //build full string in function call
      requestToSend = `servicerequest "${request.join('" "')}"`
      log.debug(requestToSend);
      break;
   }
   requestString = requestToSend;
   sendToSCLI(requestString);
}

function readState(state, callback) {
  const a = new eventAnalytics.event();
  log.debug(`savantLib.readState - Looking for state: "${state}"`);
  sendToSCLI(`readstate "${state}"`, function(response) {
    log.debug(`savantLib.readState - response: ${response}`);
    response = response.replace(/(\r\n|\n|\r)/gm, "");
    a.sendTime("readState", state);
    callback(response, state);
  });
}

function readStateQ(state) {
  const defer = q.defer();
  readState(state, (stateValue) => {
    defer.resolve(stateValue);
  });
  return defer.promise;
}

function readMultipleState(state, callback) {
  const a = new eventAnalytics.event();
  log.debug(`savantLib.readMultipleState - Looking for state: "${state}"`);
  sendToSCLI(`readstate "${state}"`, function(response) {
    log.debug(`savantLib.readMultipleState - Readstate response: ${response}`);
    response = response.split(/\n/);
    response = response.filter(function(x) {
      //remove emmpty
      return x !== undefined || "";
    });
    a.sendTime("readMultipleState",state);
    callback(response, state);
  });
}

function readMultipleStateQ(state) {
  const defer = q.defer();
  readMultipleState(state, (stateValue) => {
    defer.resolve(stateValue);
  });
  return defer.promise;
}

function writeState(state, value) {
  requestString = `writestate "${state}" "${value}"`;
  log.debug(`savantLib.writeState - Requesting state: ${requestString}`);
  sendToSCLI(requestString);
}

function getSceneNames() {
  const a = new eventAnalytics.event();
  const defer = q.defer();
  log.debug("savantLib.getSceneNames - Requesting scenes");
  sendToSCLI("getSceneNames", function(response) {
    log.debug(`savantLib.getSceneNames - getSceneNames response: ${response}`);
    response = response.split(/\n/);
    response = response.filter(function(x) {
      return x !== undefined || "";
    });
    var ret = {};
    for (var key in response) {
      const scene = response[key].split(",");
      ret[scene[0]] = {
        name: scene[0],
        id: scene[1],
        user: scene[2]
      };
    }
    a.sendTime("getSceneNames");
    defer.resolve(ret);
  });
  return defer.promise;
}

function activateScene(scene) {
  requestString = `activateScene "${scene.name}" "${scene.id}" "${scene.user}"`;
  log.debug(`activateScene.activateScene - activating Scene: ${scene.name}`);
  sendToSCLI(requestString);
}

function sendToSCLI(consoleString, callback) {
  const a = new eventAnalytics.event();
  const fullCommand = `${sclibridgePath} ${consoleString}`;
  log.info(`savantLib.sendToSCLI - Running: ${fullCommand}`);

  const child = require("child_process");
  const ps = child.exec(fullCommand, (error, stdout, stderr) => {
    log.info(`savantLib.sendToSCLI - SCLI Response: ${stdout}`);
    if(error) {
      log.error(`savantLib.sendToSCLI - error: ${error}`);
      log.error(`savantLib.sendToSCLI - error.code: ${error.code}`);
      log.error(`savantLib.sendToSCLI - error.signal: ${error.signal}`);
      log.error(`savantLib.sendToSCLI - stderr: ${stderr}`);
    }

    if(typeof callback !== "undefined") {
      a.sendTime("sendToSCLI",consoleString.substr(0,consoleString.indexOf(" ")));
      callback(stdout);
    }
  });
}

module.exports = {
  serviceRequest,
  readState,
  readStateQ,
  readMultipleState,
  readMultipleStateQ,
  writeState,
  getSceneNames,
  activateScene,
}