const action = require('../lib/actionLib');
const _ = require('lodash');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'lowerVolume',
  version: '3.0',
  description: 'Lower volume for AV zone by a preset amount',
  enabled: true,
  required: {
    resolve: ['zoneWithZone', 'zoneWithService'],
    test: {
      1: { scope: 'zone', attribute: 'actionable' },
      2: { scope: 'zone', attribute: 'speakable' }
    }
  },
  voiceMessages: {
    success: 'Lowering volume in {0}'
  },
  slots: {
    ZONE: 'ZONE',
    ZONE_TWO: 'ZONE_TWO'
  },
  utterances: [
    '{decreasePrompt} volume in {-|ZONE}',
    'Make {-|ZONE} lower',
    'lower {-|ZONE}',
    '{decreasePrompt} volume in {-|ZONE} and {-|ZONE_TWO}',
    'Make {-|ZONE} and {-|ZONE_TWO} lower'
  ]
};

function lowerVolume(req, res) {
  const zone = _.get(req.sessionAttributes, 'error', {}) === 0 ? _.get(req.sessionAttributes, 'zone', {}) : null;
  if (!zone) {
    return log.error(`${intentDictionary.name} - intent not run verify failed`);
  }
  action.relativeVolume(zone.actionable, -6, 10);
  app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.success, zone.speakable)));
}

module.exports = (app, callback) => {
  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name, {
      slots: intentDictionary.slots,
      utterances: intentDictionary.utterances
    }, lowerVolume);
  }
  callback(intentDictionary);
};