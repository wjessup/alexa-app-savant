const eventAnalytics = require('./eventAnalytics'),
    _ = require('lodash'),
    q = require('q');

function serviceRequest(requestIn, typeIn, argumentIn, argumentValueIn) {
    log.debug("serviceRequest sending:" + requestIn);

    let requestToSend = '';

    switch (typeIn.toLowerCase()) {
        case "zone":
            requestToSend = `servicerequest "${requestIn[0]}" "" "" "" "" "${requestIn[1]}"`;
            break;
        case "volume":
            requestToSend = `servicerequest "${requestIn[0]}" "" "" "" "" "SetVolume" "VolumeValue" "${argumentValueIn[0]}"`;
            break;
        case "custom":
            requestToSend = `servicerequest "${customWorkflowScope[0]}" "${customWorkflowScope[1]}" "" "1" "SVC_GEN_GENERIC" "${requestIn[0]}"`;
            break;
        case "lighting":
            requestToSend = `servicerequest "${requestIn[0]}" "" "" "" "SVC_ENV_LIGHTING" "__RoomSetBrightness" "BrightnessLevel" "${argumentValueIn[0]}"`;
            break;
        case "full":
            requestToSend = `servicerequest "${requestIn.join('" "')}"`;
            log.debug(requestToSend);
            break;
    }

    sendToSCLI(requestToSend);
}

function readState(stateIn, callback) {
    log.debug("savantLib.readState - Looking for state: \"" + stateIn + "\"");
    sendToSCLI("readstate \"" + stateIn + "\"", function (response) {
        log.debug("savantLib.readState - response: " + response);

        response = response.replace(/(\r\n|\n|\r)/gm, "");

        const ea = new eventAnalytics.event();
        ea.sendTime("readState", stateIn);
        callback(response, stateIn);
    });
}

function readStateQ(stateIn) {
    return q.Promise(function (resolve) {
        readState(stateIn, function (stateValue) {
            resolve(stateValue);
        });
    });
}

function readMultipleState(stateIn, callback) {
    log.debug("savantLib.readMultipleState - Looking for state: \"" + stateIn + "\"");
    sendToSCLI("readstate \"" + stateIn + "\"", function (response) {
        log.debug("savantLib.readMultipleState - Readstate response: " + response);

        response = response.split(/\n/).filter(x => x !== (undefined || ''));

        const ea = new eventAnalytics.event();
        ea.sendTime("readMultipleState", stateIn);
        callback(response, stateIn);
    });
}

function readMultipleStateQ(stateIn) {
    return q.Promise(function (resolve) {
        readMultipleState(stateIn, function (stateValue) {
            resolve(stateValue);
        });
    });
}

function writeState(stateIn, valueIn) {
    log.debug(`savantLib.writeState - Requesting state: writestate "${stateIn}" "${valueIn}"`);
    sendToSCLI(`writestate "${stateIn}" "${valueIn}"`);
}

function getSceneNames() {
    const defer = q.defer();
    log.debug("savantLib.getSceneNames - Requesting scenes");
    sendToSCLI("getSceneNames", function (response) {
        log.debug("savantLib.getSceneNames - getSceneNames response: " + response);

        response = response.split(/\n/).filter(x => x !== (undefined || ''));

        const ret = {};
        for (const key in response) {
            const scene = response[key].split(',');
            ret[scene[0]] = {
                name: scene[0],
                id: scene[1],
                user: scene[2]
            };
        }

        const ea = new eventAnalytics.event();
        ea.sendTime("getSceneNames");
        defer.resolve(ret);
    });
    return defer.promise;
}

function activateScene(scene) {
    log.debug("activateScene.activateScene - Activating Scene: " + scene.name);
    sendToSCLI(`activateScene "${scene.name}" "${scene.id}" "${scene.user}"`);
}

function sendToSCLI(consoleString, callback) {
    const fullcommand = sclibridgePath + " " + consoleString;
    log.info("savantLib.sendToSCLI - Running:  " + fullcommand);

    const child = require('child_process');
    const ps = child.exec(fullcommand, (error, stdout, stderr) => {
        log.info('savantLib.sendToSCLI - SCLI Response: ' + stdout);

        if (error) {
            log.error('savantLib.sendToSCLI - error: ' + error);
            log.error('savantLib.sendToSCLI - error.code: ' + error.code);
            log.error('savantLib.sendToSCLI - error.signal: ' + error.signal);
            log.error('savantLib.sendToSCLI - stderr: ' + stderr);
        }

        if (callback) {
            const ea = new eventAnalytics.event();
            ea.sendTime("sendToSCLI", consoleString.substr(0, consoleString.indexOf(' ')));
            callback(stdout);
        }
    });
}

module.exports = {
    serviceRequest: serviceRequest,
    readState: readState,
    readStateQ: readStateQ,
    readMultipleState: readMultipleState,
    readMultipleStateQ: readMultipleStateQ,
    writeState: writeState,
    getSceneNames: getSceneNames,
    activateScene: activateScene
}