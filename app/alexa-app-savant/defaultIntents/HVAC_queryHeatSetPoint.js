const savantLib = require('../lib/savantLib');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'queryHeatSetPoint',
  version: '3.0',
  description: 'Get current heat point temperature for single HVAC zone. NOTE: change tstatScope in config file',
  enabled: true,
  required: {
    resolve: [],
    test: {},
  },
  voiceMessages: {
    success: 'The Heat is currently set to {0} degrees',
  },
  slots: {},
  utterances: ['what is the current Heat {set |} {point |}', 'what is the heat {set |} {to |}'],
};

function getAppIntent(req, res) {
  const a = new eventAnalytics.Event(intentDictionary.name);

  return app.prep(req, res)
    .then(() => savantLib.readStateQ(tstatScope[1] + '.' + tstatScope[2] + '.ThermostatCurrentHeatPoint_' + tstatScope[5]))
    .then((stateValue) => {
      const message = format(intentDictionary.voiceMessages.success, stateValue);
      app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', message));
      a.sendHVAC(['ThermostatCurrentHeatPoint_',stateValue]);
    })
    .catch((err) => {
      app.intentErr(req, res, err);
    });
}

if (intentDictionary.enabled) {
  app.intent(intentDictionary.name, { slots: intentDictionary.slots, utterances: intentDictionary.utterances }, getAppIntent);
}

callback(intentDictionary);