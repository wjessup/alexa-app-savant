const action = require('../lib/actionLib');
const eventAnalytics = require('../lib/eventAnalytics');
const fs = require('fs');
const path = require('path');
const plist = require('simple-plist');
const savantLib = require('../lib/savantLib');
const _ = require('lodash');
const format = require('simple-fmt');

module.exports = function (app, callback) {

  const intentDictionary = {
    name: 'setVolumePreset',
    version: '3.0',
    description: 'Set volume Preset for AV zone with current value',
    enabled: true,
    required: {
      resolve: ['zoneWithZone', 'zoneWithService', 'rangeWithRange'],
      test: {
        1: { scope: 'zone', attribute: 'actionable' },
        2: { scope: 'zone', attribute: 'speakable' },
        3: { scope: 'params', attribute: 'range' },
      },
    },
    voiceMessages: {
      success: 'Saving volume preset {0} in {1}',
    },
    slots: { RANGE:'RANGE', ZONE:'ZONE' },
    utterances: ['save current volume to {preset |} {-|RANGE} in {-|ZONE}'],
  };

  const getUserPresets = () => {
    const userPresetsFile = path.resolve(__dirname, '../userFiles/userPresets.plist');
    const isFileExists = fs.existsSync(userPresetsFile);
    return isFileExists ? plist.readFileSync(userPresetsFile) : {};
  };

  const setVolumePreset = (req, res) => {
    const analytics = new eventAnalytics.event(intentDictionary.name);
    let zone, params;
    if (_.get(req.sessionAttributes, 'error', 0) === 0) {
      zone = _.get(req.sessionAttributes, 'zone', {});
      params = _.get(req.sessionAttributes, 'params', {});
    } else {
      log.error(intentDictionary.name + ' - intent not run verify failed');
      return;
    }
    zone.actionable.forEach(actionableZone => {
      savantLib.readStateQ(`${actionableZone}.CurrentVolume`)
        .then((currentVolume) => {
          const userPresets = getUserPresets();
          userPresets.volume[actionableZone][params.range] = currentVolume;
          plist.writeFileSync(path.resolve(__dirname, '../userFiles/userPresets.plist'), userPresets);
          analytics.sendAlexa([ 'setVolumePreset', params.range, currentVolume ]);
        })
        .catch((err) => {
          throw err;
        });
    }, params);
    const voiceMessage = format(intentDictionary.voiceMessages.success, params.range, zone.speakable);
    app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage));
  };

  const intentSetUp = app.intent.bind(app, intentDictionary.name, {
    slots: intentDictionary.slots,
    utterances: intentDictionary.utterances,
  }, setVolumePreset);

  if (intentDictionary.enabled) {
    intentSetUp();
  }

  callback(intentDictionary);
};