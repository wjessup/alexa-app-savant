const actionLib = require('../lib/actionLib');
const _ = require('lodash');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'powerOff',
  version: '3.0',
  description: 'Power off requested zone AV or lighting',
  enabled: true,
  required: {
    resolve: ['zoneWithZone', 'zoneWithService'],
    test: [
      { scope: 'zone', attribute: 'actionable' },
      { scope: 'zone', attribute: 'speakable' }
    ],
    failMessage: ['zoneService']
  },
  voiceMessages: {
    success: {
      lighting: 'Turning off lights in {0}',
      av: 'Turning off {0}'
    }
  },
  slots: {
    ZONE: 'ZONE',
    ZONE_TWO: 'ZONE_TWO',
    LIGHTING: 'LIGHTING'
  },
  utterances: [
    '{actionPrompt} off',
    '{actionPrompt} off {-|ZONE}',
    '{actionPrompt} {-|ZONE} off',
    '{actionPrompt} {-|ZONE} and {-|ZONE_TWO} off',
    '{actionPrompt} off {-|LIGHTING}',
    '{actionPrompt} off {-|ZONE} {-|LIGHTING}',
    '{actionPrompt} off {-|ZONE} and {-|ZONE_TWO} {-|LIGHTING}',
    '{actionPrompt} {-|LIGHTING} off in {-|ZONE}',
    '{actionPrompt} {-|LIGHTING} off in {-|ZONE} and {-|ZONE_TWO}'
  ]
};

module.exports = function(app, callback) {
  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name, {
      slots: intentDictionary.slots,
      utterances: intentDictionary.utterances
    }, function(req, res) {
      const a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {
          if (_.get(req.sessionAttributes, 'error', {}) === 0) {
            const zone = _.get(req.sessionAttributes, 'zone', {});
            if (req.slot('LIGHTING')) {
              a.sendLighting([zone, 'Off', req.slot('LIGHTING')]);
              return actionLib.setLighting(zone.actionable, 0, 'percent').thenResolve(format(intentDictionary.voiceMessages.success['lighting'], zone.speakable));
            } else {
              a.sendAV([zone, 'Zone', 'PowerOff']);
              return actionLib.powerOffAV(zone.actionable).thenResolve(format(intentDictionary.voiceMessages.success['av'], zone.speakable));
            }
          } else {
            console.log(intentDictionary.name + ' - intent not run, verify failed');
          }
        })
        .then(function(voiceMessage) {
          app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage));
        })
        .fail(function(err) {
          app.intentErr(req, res, err);
        });
    });
  }

  callback(intentDictionary);
};