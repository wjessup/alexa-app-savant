const action = require('../lib/actionLib');
const _ = require('lodash');
const savantLib = require('../lib/savantLib');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app, callback) {

  const intentDictionary = {
    name: 'lightsOffAVZoneGlobal',
    version: '3.0',
    description: 'Turn off lights in a defined AV zone using Savants __RoomSetBrightness workflow',
    enabled: true,
    required: {
      resolve: [],
      test: {},
      failMessage: []
    },
    voiceMessages: {
      success: 'Turning off lights in all zones',
      error: {}
    },
    slots: {},
    utterances: ['{actionPrompt} off all lights', '{actionPrompt} off lights in all zones'],
    placeholder: {
      zone: {
        actionable: [],
        speakable: []
      }
    }
  };

  function handleIntent(req, res) {
    const a = new eventAnalytics.event(intentDictionary.name);
    return app.prep(req, res)
      .then(() => {
        _.forEach(appDictionaryArray, zone => {
          savantLib.serviceRequest([zone], 'lighting', '', [0]);
        });
        a.sendLighting([intentDictionary.placeholder.zone, 'Off', '']);
      })
      .then(() => {
        const successMessage = app.builderSuccess(intentDictionary.name, 'endSession', intentDictionary.voiceMessages.success);
        app.intentSuccess(req, res, successMessage);
      })
      .catch(err => {
        console.error(err);
        app.intentErr(req, res, err);
      });
  }

  if (intentDictionary.enabled) {
    app.intent(
      intentDictionary.name,
      {
        slots: intentDictionary.slots,
        utterances: intentDictionary.utterances
      },
      handleIntent
    );
  }

  // Return intent meta info to index
  callback(intentDictionary);
};