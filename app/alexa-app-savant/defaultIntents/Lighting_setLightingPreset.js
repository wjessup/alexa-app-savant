
const action = require('../lib/actionLib');
const eventAnalytics = require('../lib/eventAnalytics');
const fs = require('fs');
const path = require('path');
const plist = require('simple-plist');
const savantLib = require('../lib/savantLib');
const _ = require('lodash');
const format = require('simple-fmt');

const intentDictionary = {
  name : 'setLightingPreset',
  version : '3.0',
  description : 'Set lighting Preset for AV with current value',
  enabled : true,
  required : {
    resolve: ['zoneWithZone', 'zoneWithService', 'rangeWithRange'],
    test: {
      1 : { scope: 'zone', attribute: 'actionable' },
      2 : { scope: 'zone', attribute: 'speakable' },
      3 : { scope: 'prams', attribute: 'range' }
    }
  },
  voiceMessages : {
    success : 'Saving lighting preset {0} in {1}'
  },
  slots : { 
    RANGE: 'RANGE',
    ZONE: 'ZONE'
  },
  utterances : ['save current lighting level to {preset |} {-|RANGE} in {-|ZONE}']
};

function getZoneAndParams(req) {
  if (_.get(req.sessionAttributes, 'error', {}) === 0) {
    const zone = _.get(req.sessionAttributes, 'zone', {});
    const params = _.get(req.sessionAttributes, 'prams', {});
    return { zone, params };
  }
  log.error(intentDictionary.name + ' - intent not run verify failed');
  return null;
}

function saveCurrentLightingLevel(zone, params, userPresets) {
  zone.actionable.forEach((zoneName) => {
    const currentLevel = savantLib.readStateQ(`${zoneName}.BrightnessLevel`);
    log.info(intentDictionary.name + ' - Saving current lighting level:' + currentLevel);
    userPresets.volume[zoneName][params.range] = currentLevel;
    const userPresetsFile = path.resolve(__dirname, '../userFiles/userPresets.plist');
    if (fs.existsSync(userPresetsFile)) {
      log.error(intentDictionary.name + ' - Writing user preset');
      plist.writeFileSync(userPresetsFile, userPresets);
    }
    new eventAnalytics.event(intentDictionary.name).sendAlexa(['setLightingPreset', params.range, currentLevel]);
  });
}

module.exports = function(app, callback) {
  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name, { slots: intentDictionary.slots, utterances: intentDictionary.utterances }, (req, res) => {
      const zoneAndParams = getZoneAndParams(req);
      if (!zoneAndParams) { return; }
      
      saveCurrentLightingLevel(zoneAndParams.zone, zoneAndParams.params, userPresets);

      const voiceMessage = format(intentDictionary.voiceMessages.success, zoneAndParams.params.range, zoneAndParams.zone.speakable);
      app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage));
    }).fail((err) => {
      app.intentErr(req,res,err);
    });
  }
    
  callback(intentDictionary);
};