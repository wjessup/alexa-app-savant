const action = require('../lib/actionLib');
const _ = require('lodash');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'setVolumeValue',
  version: '3.0',
  description: 'Set volume for AV zone in percentage',
  enabled: true,
  required: {
    resolve: ['zoneWithZone', 'zoneWithService'],
    test: {
      1: { scope: 'zone', attribute: 'actionable' },
      2: { scope: 'zone', attribute: 'speakable' }
    }
  },
  voiceMessages: {
    success: 'Setting volume to {0} in {1}',
    error: { outOfRange: 'I didn\'t understand. Please try again. Say a number between 1 and 100.' }
  },
  slots: { VOLUMEVALUE: 'NUMBER', ZONE: 'ZONE' },
  utterances: [
    'set volume in {-|ZONE} to {0-100|VOLUMEVALUE} {percent|}',
    'set {-|ZONE} volume to {0-100|VOLUMEVALUE} {percent|}'
  ]
};

module.exports = function (app, callback) {
  if (!intentDictionary.enabled) return callback(null);

  app.intent(intentDictionary.name, {
    slots: intentDictionary.slots,
    utterances: intentDictionary.utterances
  }, handleIntent);

  function handleIntent(req, res) {
    const a = new eventAnalytics.event(intentDictionary.name);
    app.prep(req, res)
      .then(() => {
        if (_.get(req.sessionAttributes, 'error', 0) !== 0) {
          throw new Error(`${intentDictionary.name} - intent not run verify failed`);
        }
        const zone = _.get(req.sessionAttributes, 'zone', {});
        const value = Number(req.slot('VOLUMEVALUE'));
        if (value < 1 || value > 100 || isNaN(value)) {
          throw app.builderErr(intentDictionary.name, 'endSession', intentDictionary.voiceMessages.error.outOfRange, 'outOfRange');
        }
        action.setVolume(zone.actionable, value, 'percent');
        a.sendAV([zone, 'Zone', 'SetVolume', { value, type: 'set' }]);
        return format(intentDictionary.voiceMessages.success, value, zone.speakable);
      })
      .then((voiceMessage) => {
        app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage));
      })
      .fail((err) => {
        app.intentErr(req, res, err);
      });
  }

  callback(intentDictionary);
};