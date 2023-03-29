const eventAnalytics = require('./eventAnalytics');
const _ = require('lodash');
const q = require('q');
const child_process = require('child_process');
const log = require('./logger'); // Assuming there is a logger module
const sclibridgePath = "path/to/sclibridge"; // Assuming path to sclibridge is defined

function buildRequest(type, requestIn, argumentIn, argumentValueIn) {
  switch (type.toLowerCase()) {
    case "zone":
      return `servicerequest "${requestIn[0]}" "" "" "" "" "${requestIn[1]}"`;
    case "volume":
      return `servicerequest "${requestIn[0]}" "" "" "" "" "SetVolume" "VolumeValue" "${argumentValueIn[0]}"`;
    case "custom":
      return `servicerequest "${customWorkflowScope[0]}" "${customWorkflowScope[1]}" "" "1" "SVC_GEN_GENERIC" "${requestIn[0]}"`;
    case "lighting":
      return `servicerequest "${requestIn[0]}" "" "" "" "" "SVC_ENV_LIGHTING" "__RoomSetBrightness" "BrightnessLevel" "${argumentValueIn[0]}"`;
    case "full":
      return `servicerequest "${requestIn.join('" "')}"`;
    default:
      return "";
  }
}

function serviceRequest(requestIn, typeIn, argumentIn, argumentValueIn) {
  log.debug(`serviceRequest sending: ${requestIn}`);
  const requestString = buildRequest(typeIn, requestIn, argumentIn, argumentValueIn);
  sendToSCLI(requestString);
}

function sendToSCLI(consoleString, callback) {
  const a = new eventAnalytics.event();
  const fullCommand = `${sclibridgePath} ${consoleString}`;
  
  log.info(`savantLib.sendToSCLI - Running: ${fullCommand}`);
  
  child_process.exec(fullCommand, (error, stdout, stderr) => {
    log.info(`savantLib.sendToSCLI - SCLI Response: ${stdout}`);

    if (error) {
      log.error(`savantLib.sendToSCLI - error: ${error}`);
      log.error(`savantLib.sendToSCLI - error.code: ${error.code}`);
      log.error(`savantLib.sendToSCLI - error.signal: ${error.signal}`);
      log.error(`savantLib.sendToSCLI - stderr: ${stderr}`);
    }

    if (callback) {
      a.sendTime("sendToSCLI", consoleString.substr(0, consoleString.indexOf(' ')));
      callback(stdout);
    }
  });
}

function readState(stateIn, callback) {
  const a = new eventAnalytics.event();
  log.debug(`savantLib.readState - Looking for state: "${stateIn}"`);
  sendToSCLI(`readstate "${stateIn}"`, (response) => {
    log.debug(`savantLib.readState - response: ${response}`);
    response = response.replace(/(\r\n|\n|\r)/gm, "");
    a.sendTime("readState", stateIn);
    callback(response, stateIn);
  });
}

// Other functions implementation omitted for brevity. The implementation should
// be similar to readState

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