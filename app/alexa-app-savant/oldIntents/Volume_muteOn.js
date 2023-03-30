const savantLib = require('../lib/savantLib');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'fanSpeed',
  version: '3.0',
  description: 'Control fan with presets high/med/low as well as on/off',
  enabled: true,
  required: {
    resolve: {},
    test: {}
  },
  voiceMessages: {
    success: 'Setting fan to {0}',
    error: 'I didnt understand please try again. Say On,Off,High,Medium,or Low'
  },
  slots: {SPEED: "LITERAL"},
  utterances: ["{actionPrompt} {kitchen |} fan to {speedPrompt|SPEED}", "{actionPrompt} {on|off|SPEED} {the |} {kitchen |} fan"],
  placeholder: {zone: { actionable: [], speakable: [] }}
};

module.exports = function (app, callback) {
  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name, { slots: intentDictionary.slots, utterances: intentDictionary.utterances }, function (req, res) {
      const a = new eventAnalytics.event(intentDictionary.name);
      const speed = req.slot('SPEED').toLowerCase();

      let fanSpeed;

      switch (speed) {
        case "high":
        case "hi":
          fanSpeed = 'HVAC_KitchenFan_High';
          break;

        case "medium":
        case "on":
          fanSpeed = 'HVAC_KitchenFan_Med';
          break;

        case "low":
          fanSpeed = 'HVAC_KitchenFan_Low';
          break;

        case "off":
          fanSpeed = 'HVAC_KitchenFan_Off';
          break;

        default:
          throw app.builderErr(intentDictionary.name, 'endSession', intentDictionary.voiceMessages.error, 'noSpeedMatch');
      }

      savantLib.serviceRequest([fanSpeed], "custom");
      app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.success, speed)));
    });
  }

  // Return intent meta info to index
  callback(intentDictionary);
};