const
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics'),
  fs = require('fs'),
  path = require('path'),
  plist = require('simple-plist'),
  savantLib = require('../lib/savantLib'),
  _ = require('lodash'),
  format = require('simple-fmt');

module.exports = function(app,callback){

  var intentDictionary = {//Intent meta information
    'name' : 'setLightingPreset',
    'version' : '3.0',
    'description' : 'Set lighting Preset for AV with current value',
    'enabled' : 1,
    'required' : {
      'resolve': ['zoneWithZone','zoneWithService','rangeWithRange'],
      'test': {
        '1' : {'scope': 'zone', 'attribute': 'actionable'},
        '2' : {'scope': 'zone', 'attribute': 'speakable'},
        '3' : {'scope': 'prams', 'attribute': 'range'}
      }
    },
    'voiceMessages' : {
      'success' : 'Saving lighting preset {0} in {1}'
    },
    'slots' : {'RANGE':'RANGE','ZONE':'ZONE'},
    'utterances' : ['save current lighting level to {preset |} {-|RANGE} in {-|ZONE}']
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function (){
          if (_.get(req.sessionAttributes,'error',{}) === 0){
            var zone = _.get(req.sessionAttributes,'zone',{});
            var prams = _.get(req.sessionAttributes,'prams',{});
          }else {
            log.error(intentDictionary.name+' - intent not run verify failed')
            return
          }
          _.forEach(zone.actionable, function(zone){
            savantLib.readStateQ(zone+'.BrightnessLevel')
            .then(function (currentLevel){
              log.info(intentDictionary.name+' - Saving current lighting level:'+currentLevel)
              userPresets.volume[zone][prams.range] = currentLevel;
              var userPresetsFile = path.resolve(__dirname,'../userFiles/userPresets.plist');
              if (fs.existsSync(userPresetsFile)) {
                log.error(intentDictionary.name + ' - Writing user preset');
                plist.writeFileSync(userPresetsFile, userPresets);
              }
              a.sendAlexa(['setLightingPreset',prams.range,currentLevel]);
            });
          },prams);
          return format(intentDictionary.voiceMessages.success,prams.range,zone.speakable)
        })
        .then(function (voiceMessage){
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',voiceMessage))
        })
        .fail(function(err) {
          app.intentErr(req,res,err);
        });
    }
    );
  }
  callback(intentDictionary);
};
