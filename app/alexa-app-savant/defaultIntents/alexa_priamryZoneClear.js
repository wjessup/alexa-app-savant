const savantLib = require('../lib/savantLib');
const currentZoneLib = require('../lib/currentZoneLib');
const eventAnalytics = require('../lib/eventAnalytics');

module.exports = function clearPrimaryZoneIntent(app, callback) {
  const intentDictionary = {
    name: 'ClearPrimaryZone',
    version: '3.0',
    description: 'Tell Alexa what zone you are in',
    enabled: true,
    required: {
      resolve: {},
      test: {}
    },
    voiceMessages: {
      success: 'Primary zone cleared.'
    },
    slots: {},
    utterances: [
      '{clear|remove} {primary|current} zone'
    ]
  };

  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name, {
      slots: intentDictionary.slots,
      utterances: intentDictionary.utterances
    }, (req, res) => {
      const { name } = intentDictionary;
      const a = new eventAnalytics.event(name);
      const currentZonePrevious = currentZoneLib.get();
      currentZoneLib.set(false, 'speakable');
      currentZoneLib.set(false, 'actionable');

      return app.prep(req, res)
        .then((req) => {
          app.intentSuccess(req, res, app.builderSuccess(name, 'endSession', intentDictionary.voiceMessages.success));
          a.sendAlexa(['PrimaryZoneClear', currentZonePrevious]);
        })
        .catch((err) => {
          app.intentErr(req, res, err);
        });
    });
  }

  callback(intentDictionary);
};