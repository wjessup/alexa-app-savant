const savantLib = require('../lib/savantLib');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'queryCoolSetPoint',
  version: '3.0',
  description: 'Get current cool point temperature for single HVAC zone. NOTE: change tstatScope in config file',
  enabled: true,
  required: {
    resolve: [],
    test: {}
  },
  voiceMessages: {
    success: 'The AC is currently set to {0} degrees'
  },
  slots: {},
  utterances: ['what is the current Cool {set |} {point |}', 'what is the a.c. set to']
};

function queryCoolSetPoint(req, res) {
  const a = new eventAnalytics.event(intentDictionary.name);

  savantLib.readStateQ(`${tstatScope[1]}.${tstatScope[2]}.ThermostatCurrentCoolPoint_${tstatScope[5]}`)
    .then((stateValue) => {
      app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.success, stateValue)));
      a.sendHVAC([`ThermostatCurrentCoolPoint_${stateValue}`]);
    })
    .catch((err) => {
      app.intentErr(req, res, err);
    });
}

module.exports = function (app, callback) {
  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name, { slots: intentDictionary.slots, utterances: intentDictionary.utterances }, queryCoolSetPoint);
  }
  callback(intentDictionary);
};