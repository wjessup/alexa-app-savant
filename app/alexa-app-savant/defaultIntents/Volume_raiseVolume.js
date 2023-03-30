const action = require('../lib/actionLib');
const _ = require('lodash');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'raiseVolume',
  version: '3.0',
  description: 'Increase volume for AV zone by a preset amount',
  enabled: true,
  required: {
    resolve: ['zoneWithZone', 'zoneWithService'],
    test: [
      { scope: 'zone', attribute: 'actionable' },
      { scope: 'zone', attribute: 'speakable' }
    ]
  },
  voiceMessages: {
    success: 'Increasing volume in {0}'
  },
  slots: {
    ZONE: 'ZONE',
    ZONE_TWO: 'ZONE_TWO'
  },
  utterances: [
    '{increasePrompt} volume in {-|ZONE}',
    'Make {-|ZONE} louder',
    '{increasePrompt} volume in {-|ZONE} and {-|ZONE_TWO}',
    'Make {-|ZONE} and {-|ZONE_TWO} louder'
  ]
};

if (intentDictionary.enabled) {
  module.exports = function(app, callback) {
    app.intent(
      intentDictionary.name,
      { slots: intentDictionary.slots, utterances: intentDictionary.utterances },
      function(req, res) {
        const a = new eventAnalytics.event(intentDictionary.name);
        return app.prep(req, res)
          .then(() => {
            const error = _.get(req.sessionAttributes, 'error');
            if (error === 0) {
              const zone = _.get(req.sessionAttributes, 'zone');
              action.relativeVolume(zone.actionable, 6, 10);
              return zone;
            } else {
              throw new Error(`${intentDictionary.name} - intent not run verify failed`);
            }
          })
          .then(zone => {
            const message = format(intentDictionary.voiceMessages.success, zone.speakable);
            const success = app.builderSuccess(intentDictionary.name, 'endSession', message);
            app.intentSuccess(req, res, success);
          })
          .catch(err => {
            app.intentErr(req, res, err);
          });
      }
    );
  };

  callback(intentDictionary);
}