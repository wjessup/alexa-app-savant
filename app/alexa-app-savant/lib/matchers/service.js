const eventAnalytics = require('./eventAnalytics');
const _ = require('lodash');
const q = require('q');

function serviceRequest(requestToSend, typeIn, argumentValueIn) {
  log.debug(`serviceRequest sending:${requestToSend}`);
  
  switch (typeIn.toLowerCase()) {

  case "zone":
    //only pass [zone,request]
    requestToSend=["servicerequest \""+requestToSend[0]+"\" \"\" \"\" \"\" \"\" \""+requestToSend[1]+"\""];
    break;

  case "volume":
    //only pass [zone,request]
    requestToSend=["servicerequest \""+requestToSend[0]+"\" \"\" \"\" \"\" \"\" \"SetVolume\" \"VolumeValue\" \""+argumentValueIn[0]+"\""];
    break;

  case "custom":
    //only pass request and asume its in dining genric
    requestToSend=["servicerequest \""+customWorkflowScope[0]+"\" \""+customWorkflowScope[1]+"\" \"\" \"1\" \"SVC_GEN_GENERIC\" \""+requestToSend[0]+"\""];
    break;

  case "lighting":
    //pass zone and %
    requestToSend=["servicerequest \""+requestToSend[0]+"\" \"\" \"\" \"\" \"SVC_ENV_LIGHTING\" \"__RoomSetBrightness\" \"BrightnessLevel\" \""+argumentValueIn[0]+"\""];
    break;

  case "full":
    //build full string in function call
    requestToSend="servicerequest \""+requestToSend.join("\" \"")+"\"";
    log.debug(requestToSend);
    break;
  }

  sendToSCLI(requestToSend);
}

function readState(stateIn){
  const a = new eventAnalytics.event();
  log.debug(`savantLib.readState - Looking for state: "${stateIn}"`);

  sendToSCLI(`readstate "${stateIn}"`, (response) => {
    log.debug(`savantLib.readState - response: ${response}`);
    response = response.replace(/(\r\n|\n|\r)/gm,"");
    a.sendTime("readState", stateIn);

    return response;
  });
}

function readStateQ(stateIn) {
  const defer = q.defer();

  readState(stateIn).then((stateValue) => {
    defer.resolve(stateValue);
  });

  return defer.promise;
}

function readMultipleState(stateIn) {
  const a = new eventAnalytics.event();
  log.debug(`savantLib.readMultipleState - Looking for state: "${stateIn}"`);

  sendToSCLI(`readstate "${stateIn}"`, (response) => {
    log.debug(`savantLib.readMultipleState - Readstate response: ${response}`);
    response = response.split(/\n/).filter(x => x !== (undefined || ''));
    a.sendTime("readMultipleState", stateIn);

    return response;
  });
}

function readMultipleStateQ(stateIn) {
  const defer = q.defer();

  readMultipleState(stateIn).then((stateValue) => {
    defer.resolve(stateValue);
  });

  return defer.promise;
}

function writeState(stateIn, valueIn){
  const requestString = `writestate "${stateIn}" "${valueIn}"`;
  log.debug(`savantLib.writeState - Requesting state: ${requestString}`);
  
  sendToSCLI(requestString);
}

function getSceneNames() {
  const a = new eventAnalytics.event();
  const defer = q.defer();
  log.debug("savantLib.getSceneNames - Requesting scenes");

  sendToSCLI("getSceneNames", (response) => {
    log.debug(`savantLib.getSceneNames - getSceneNames response: ${response}`);
    response = response.split(/\n/).filter(x => x !== (undefined || ''));
    const ret = {};

    for (let key in response) {
      const scene = response[key].split(',');
      ret[scene[0]] = {
        name: scene[0],
        id: scene[1],
        user: scene[2]
      }
    }

    a.sendTime("getSceneNames");

    defer.resolve(ret);
  });

  return defer.promise;
}

function activateScene(scene) {
  const requestString = `activateScene "${scene.name}" "${scene.id}" "${scene.user}"`;
  log.debug(`activateScene.activateScene - Activating Scene: ${scene.name}`);

  sendToSCLI(requestString);
}

function sendToSCLI(consoleString, callback) {
  const a = new eventAnalytics.event();
  const fullCommand = `${sclibridgePath} ${consoleString}`;

  log.info(`savantLib.sendToSCLI - Running: ${fullCommand}`);

    const ps = require('child_process').exec(fullCommand, (error, stdout, stderr) => {
      log.info(`savantLib.sendToSCLI - SCLI Response: ${stdout}`);

      if (error){
        log.error(`savantLib.sendToSCLI - error: ${error}`);
        log.error(`savantLib.sendToSCLI - error.code: ${error.code}`);
        log.error(`savantLib.sendToSCLI - error.signal: ${error.signal}`);
        log.error(`savantLib.sendToSCLI - stderr: ${stderr}`);
      }

      if (typeof callback !== 'undefined'){
        a.sendTime("sendToSCLI",consoleString.substr(0,consoleString.indexOf(' ')));
        callback (stdout);
      };
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
  activateScene
};