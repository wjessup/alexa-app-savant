const actionLib = require('../lib/actionLib');
const _ = require('lodash');
const simpleFmt = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

module.exports = function setVolume(app, callback) {
  const intentDictionary = {
    name: 'setVolumeRange',
    version: '3.0',
    description: 'Set volume for AV zone with high, med, or low presets.',
    enabled: true,
    required: {
      resolve: ['zoneWithZone', 'zoneWithService', 'rangeWithRange'],
      test: {
        1: { scope: 'zone', attribute: 'actionable' },
        2: { scope: 'zone', attribute: 'speakable' },
        3: { scope: 'prams', attribute: 'range' },
      },
    },
    voiceMessages: {
      success: 'Setting volume to {0} in {1}.',
    },
    slots: { RANGE: 'RANGE', ZONE: 'ZONE' },
    utterances: [
      'set volume in {-|ZONE} {to |} {-|RANGE}',
      'set {-|ZONE} volume {to |} {-|RANGE}',
    ],
  };

  const logAndReturn = (message) => {
    console.error(message);
    return null;
  };

  if (intentDictionary.enabled) {
    app.intent(
      intentDictionary.name,
      {
        slots: intentDictionary.slots,
        utterances: intentDictionary.utterances,
      },
      (req, res) => {
        const a = new eventAnalytics.event(intentDictionary.name);

        return app
          .prep(req, res)
          .then(() => {
            const sessionAttributes = _.get(req, 'sessionAttributes');

            if (
              _.get(sessionAttributes, 'error') === 0 &&
              _.isObject(_.get(sessionAttributes, 'zone')) &&
              _.isObject(_.get(sessionAttributes, 'prams'))
            ) {
              const zone = sessionAttributes.zone;
              const prams = sessionAttributes.prams;
              const actionableZone = zone.actionable;
              const range = prams.range;

              actionLib.setVolume(actionableZone, range, 'range'); // Set volume to requested range in all zones.
              a.sendAV([zone, 'Zone', 'SetVolume', { value: range, type: 'set' }]);

              const voiceMessage = simpleFmt(
                intentDictionary.voiceMessages.success,
                range,
                zone.speakable,
              );

              app.intentSuccess(
                req,
                res,
                app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage),
              );
            } else {
              return logAndReturn(`${intentDictionary.name} - intent not run, verify failed.`);
            }
          })
          .fail((err) => {
            app.intentErr(req, res, err);
          });
      },
    );
  }

  callback(intentDictionary);
};