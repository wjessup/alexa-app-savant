const action = require('../lib/actionLib');
const _ = require('lodash');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'sleepDisarm',
  version: '3.0',
  description: 'Stop a sleep timer in a zone',
  enabled: true,
  required: {
    resolve: ['zoneWithZone'],
    test: {
      '1': { scope: 'zone', attribute: 'actionable' },
      '2': { scope: 'zone', attribute: 'speakable' },
    },
    failMessage: [],
  },
  voiceMessages: {
    success: 'Disabling timer in {0}',
    error: {},
  },
  slots: { ZONE: 'ZONE' },
  utterances: ['{Stop|disable} {sleep |} timer in {-|ZONE}'],
};

function sleepDisarmIntentHandler(req, res) {
  const a = new eventAnalytics.event(intentDictionary.name);
  app.prep(req, res)
    .then(function(req) {
      if (_.get(req.sessionAttributes, 'error', {}) === 0) {
        const zone = _.get(req.sessionAttributes, 'zone', {});
        action.sleepTimer(zone, '', 'disarm');
        a.sendSleep([zone, 'dis_sleepDisarm']);
        const voiceMessage = format(intentDictionary.voiceMessages.success, zone.speakable);
        app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage));
      } else {
        console.error(intentDictionary.name + ' - intent not run verify failed');
        app.intentErr(req, res, new Error('Failed to verify intent.'));
      }
    })
    .fail(function(err) {
      app.intentErr(req, res, err);
    });
}

module.exports = function (app, callback) {
  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name, { slots: intentDictionary.slots, utterances: intentDictionary.utterances }, sleepDisarmIntentHandler);
  }
  callback(intentDictionary);
};