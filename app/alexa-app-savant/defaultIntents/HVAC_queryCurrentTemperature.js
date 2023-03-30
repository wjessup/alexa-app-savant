const savantLib = require('../lib/savantLib');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'queryCurrentTemperature',
  version: '3.0',
  description: 'Get current temperature for single HVAC zone. NOTE: change tstatScope in config file',
  enabled: true,
  required: {
    resolve: [],
    test: {}
  },
  voiceMessages: {
    success: 'It is currently {0} degrees inside'
  },
  slots: {},
  utterances: ['what is the current temperature']
};

function queryCurrentTemperatureIntent(app, req, res) {
  const a = new eventAnalytics.event(intentDictionary.name);
  return app.prep(req, res)
      .then(() => savantLib.readStateQ(tstatScope[1] + '.' + tstatScope[2] + '.ThermostatCurrentTemperature_' + tstatScope[5]))
      .then(stateValue => {
        const message = format(intentDictionary.voiceMessages.success,stateValue);
        app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', message));
        a.sendHVAC(['ThermostatCurrentTemperature_', stateValue]);
      })
      .catch(err => app.intentErr(req, res, err));
}

module.exports = function(app, callback) {
  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name, {slots: intentDictionary.slots, utterances: intentDictionary.utterances}, 
      (req, res) => queryCurrentTemperatureIntent(app, req, res)
    );
  }
  
  callback(intentDictionary);
};