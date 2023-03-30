const _ = require('lodash');
const format = require('simple-fmt');
const actionLib = require('../lib/actionLib');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'raiseVolumeAlot',
  version: '3.0',
  description: 'Increase volume for AV zone by a large preset amount',
  enabled: true,
  required: {
    resolve: [
      'zoneWithZone',
      'zoneWithService'
    ],
    test: {
      '1': {
        scope: 'zone',
        attribute: 'actionable'
      },
      '2': {
        scope: 'zone',
        attribute: 'speakable'
      }
    }
  },
  voiceMessages: {
    success: 'Increasing volume a lot in {0}'
  },
  slots: {
    ZONE: 'ZONE',
    ZONE_TWO: 'ZONE_TWO'
  },
  utterances: [
    '{increasePrompt} volume in {-|ZONE} a lot',
    'Make {-|ZONE} much louder',
    '{increasePrompt} volume in {-|ZONE} and {-|ZONE_TWO} a lot',
    'Make {-|ZONE} and {-|ZONE_TWO} much louder'
  ]
};

module.exports = function(app, callback) {
  if (!intentDictionary.enabled) return;

  function onError(err) {
    app.intentErr(req, res, err);
  }

  function onSuccess(zone) {
    app.intentSuccess(req, res, app.builderSuccess(
      intentDictionary.name,
      'endSession',
      format(intentDictionary.voiceMessages.success, zone.speakable)
    ));
  }

  function handleIntent(req, res) {
    const zone = _.get(req.sessionAttributes, 'zone');
    if (!zone) {
      log.error(`${intentDictionary.name} - intent not run verify failed`);
      return;
    }
    actionLib.relativeVolume(zone.actionable, 20, 20);
    onSuccess(zone);
  }

  const intentHandler = (req, res) => {
    const a = new eventAnalytics.event(intentDictionary.name);
    app.prep(req, res)
      .then(function() {
        if (_.get(req.sessionAttributes, 'error') === 0) {
          handleIntent(req, res);
        }
      })
      .fail(onError);
  };

  app.intent(intentDictionary.name, {
    slots: intentDictionary.slots,
    utterances: intentDictionary.utterances,
  }, intentHandler);

  callback(intentDictionary);
};