const savantLib = require('../lib/savantLib');
const _ = require('lodash');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'powerOffGlobal',
  version: '3.0',
  description: 'Power off all zones',
  enabled: true,
  required: {
    resolve: {},
    test: {},
  },
  voiceMessages: {
    success: 'Turning off all zones',
  },
  slots: {},
  utterances: ['{actionPrompt} everything off', '{actionPrompt} off all zones', '{actionPrompt} off everything'],
  placeholder: {
    zone: {
      actionable: [],
      speakable: [],
    },
  },
};

function powerOffAllZones(req, res) {
  const a = new eventAnalytics.event(intentDictionary.name);

  return app.prep(req, res)
    .then(() => {
      log.error(`req: ${req}`);
      savantLib.serviceRequest(['', 'PowerOff'], 'zone'); //Turn off zone
      a.sendAV([intentDictionary.placeholder.zone, 'Zone', 'PowerOff']);
      app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', intentDictionary.voiceMessages.success));
    })
    .catch((err) => {
      log.error(`err: ${err}`);
      app.intentErr(req, res, err);
    });
}

if (intentDictionary.enabled) {
  app.intent(intentDictionary.name, { slots: intentDictionary.slots, utterances: intentDictionary.utterances }, powerOffAllZones);
}

callback(intentDictionary);