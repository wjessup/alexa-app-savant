const savantLib = require('../lib/savantLib');
const _ = require('lodash');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'setCoolPointTemperature',
  version: '3.0',
  description: 'Set current cool point for a single HVAC zone. NOTE: change tstatScope in the config file',
  enabled: true,
  required: {
    resolve: [],
    test: {},
    failMessage: [] //['zoneService']
  },
  voiceMessages: {
    success: 'Setting AC to {0} degrees',
    error: {
      outOfRange: 'I didn\'t understand. Please try again. Say a number between 60 and 90',
      requestMatchCurrent: 'The AC is already set to {0}'
    }
  },
  slots: {
    tempToSet: 'NUMBER'
  },
  utterances: ['{actionPrompt} {AC|A.C.|cooling} to {60-90|tempToSet} {degrees |}']
};

function setCoolPointTemperature(req, res) {
  const a = new eventAnalytics.event(intentDictionary.name);
  let currentSetPoint;
  return app.prep(req, res).then(() => {
    const tempToSet = req.slot('tempToSet');
    if (tempToSet < 59 || tempToSet > 91) {
      throw app.builderErr(intentDictionary.name, 'endSession', intentDictionary.voiceMessages.error.outOfRange, 'outOfRange');
    }
    return savantLib.readStateQ(`${tstatScope[1]}.${tstatScope[2]}.ThermostatCurrentCoolPoint_${tstatScope[5]}`);
  }).then((value) => {
    currentSetPoint = value;
    a.sendHVAC([`ThermostatCurrentCoolPoint_${currentSetPoint}`]);
    if (currentSetPoint === req.slot('tempToSet')) {
      throw app.builderErr(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.error.requestMatchCurrent, currentSetPoint), 'requestMatchCurrent');
    }
    //savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],'PowerOn'],'full');
    savantLib.serviceRequest([tstatScope[0], tstatScope[1], tstatScope[2], tstatScope[3], tstatScope[4], 'SetCoolPointTemperature', 'ThermostatAddress', tstatScope[5], 'CoolPointTemperature', req.slot('tempToSet')], 'full');
    a.sendHVAC(['SetCoolPointTemperature', req.slot('tempToSet')]);
    return format(intentDictionary.voiceMessages.success, req.slot('tempToSet'));
  }).then((voiceMessage) => {
    app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage));
  }).catch((err) => {
    app.intentErr(req, res, err);
  });
};

module.exports = function(app, callback) {
  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name, { slots: intentDictionary.slots, utterances: intentDictionary.utterances }, setCoolPointTemperature);
  }
  callback(intentDictionary);
};