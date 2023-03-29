const eventAnalytics = require('./eventAnalytics');
const child_process = require('child_process');
const q = require('q');

function createRequestToSend(type, requestIn, argumentIn = '', argumentValueIn = '') {
  const requestTemplates = {
    zone: `servicerequest "${requestIn[0]}" "" "" "" "" "${requestIn[1]}"`,
    volume: `servicerequest "${requestIn[0]}" "" "" "" "" "SetVolume" "VolumeValue" "${argumentValueIn[0]}"`,
    custom: `servicerequest "${customWorkflowScope[0]}" "${customWorkflowScope[1]}" "" "1" "SVC_GEN_GENERIC" "${requestIn[0]}"`,
    lighting: `servicerequest "${requestIn[0]}" "" "" "" "SVC_ENV_LIGHTING" "__RoomSetBrightness" "BrightnessLevel" "${argumentValueIn[0]}"`,
    full: `servicerequest "${requestIn.join('" "')}"`,
  };
  return requestTemplates[type.toLowerCase()] || "";
}

function serviceRequest(requestIn, typeIn, argumentIn = '', argumentValueIn = '') {
  log.debug(`serviceRequest sending:${requestIn}`);
  const requestString = createRequestToSend(typeIn, requestIn, argumentIn, argumentValueIn);
  sendToSCLI(requestString);
}

function sendToSCLI(consoleString, callback) {
  const fullcommand = `${sclibridgePath} ${consoleString}`;
  log.info(`savantLib.sendToSCLI - Running:  ${fullcommand}`);
  const event = new eventAnalytics.event();
  
  child_process.exec(fullcommand, (error, stdout, stderr) => {
    log.info(`savantLib.sendToSCLI - SCLI Response: ${stdout}`);
    if (error) {
      log.error(`savantLib.sendToSCLI - error: ${error}`);
      log.error(`savantLib.sendToSCLI - error.code: ${error.code}`);
      log.error(`savantLib.sendToSCLI - error.signal: ${error.signal}`);
      log.error(`savantLib.sendToSCLI - stderr: ${stderr}`);
    }
    if (callback) {
      event.sendTime("sendToSCLI", consoleString.substr(0, consoleString.indexOf(' ')));
      callback(stdout);
    }
  });
}

function readStatePromise(stateIn) {
  const defer = q.defer();
  readState(stateIn, (stateValue) => {
    defer.resolve(stateValue);
  });
  return defer.promise;
}

function readMultipleStatePromise(stateIn) {
  const defer = q.defer();
  readMultipleState(stateIn, (stateValue) => {
    defer.resolve(stateValue);
  });
  return defer.promise;
}

function parseResponse(response) {
  const lines = response.split(/\n/).filter(x => x !== (undefined || ''));
  return lines;
}

function getSceneNamesPromise() {
  const defer = q.defer();
  const event = new eventAnalytics.event();
  log.debug("savantLib.getSceneNames - Requesting scenes");
  
  sendToSCLI("getSceneNames", (response) => {
    response = parseResponse(response);
    const ret = {};
    for (const sceneString of response) {
      const [name, id, user] = sceneString.split(',');
      ret[name] = { name, id, user };
    }
    event.sendTime("getSceneNames");
    defer.resolve(ret);
  });

  return defer.promise;
}

const savantLib = {
  serviceRequest,
  readState,
  readStateQ: readStatePromise,
  readMultipleState,
  readMultipleStateQ: readMultipleStatePromise,
  writeState,
  getSceneNames: getSceneNamesPromise,
  activateScene
}

module.exports = savantLib;