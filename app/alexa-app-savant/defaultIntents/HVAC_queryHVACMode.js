const savantLib = require('../lib/savantLib');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'queryHVACMode',
  version: '3.0',
  description: 'Get current mode for single HVAC zone. NOTE: change tstatScope in config file',
  enabled: true,
  required: {
    resolve: [],
    test: {},
  },
  voiceMessages: {
    success: 'The system is currently set to {0}',
  },
  slots: {},
  utterances: [
    'what mode is the {hvacSystemPrompt} in',
    'is the {hvacSystemPrompt} on',
    'is the {hvacSystemPrompt} off',
  ],
};

function readState(tstatScope) {
  return savantLib.readStateQ(`${tstatScope[1]}.${tstatScope[2]}.ThermostatMode_${tstatScope[5]}`);
}

function queryHVACMode(req, res) {
  const a = new eventAnalytics.event(intentDictionary.name);
  return app.prep(req, res)
    .then(() => readState(tstatScope))
    .then((stateValue) => {
      const message = format(intentDictionary.voiceMessages.success, stateValue);
      app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', message));
      a.sendHVAC(['ThermostatMode_', stateValue]);
    })
    .fail((err) => {
      app.intentErr(req, res, err);
    });
}

module.exports = function(app, callback) {
  if (intentDictionary.enabled) {
    const intent = {
      'slots': intentDictionary.slots,
      'utterances': intentDictionary.utterances,
    };
    app.intent(intentDictionary.name, intent, queryHVACMode);
  }
  callback(intentDictionary);
};