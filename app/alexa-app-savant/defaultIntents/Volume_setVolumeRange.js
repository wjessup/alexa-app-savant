const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {//Intent meta information
    'name' : 'setVolumeRange',
    'version' : '3.0',
    'description' : 'Set volume for AV zone with high med low presets',
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
      'success' : 'Setting volume to {0} in {1}'
    },
    'slots' : {'RANGE':'RANGE','ZONE':'ZONE'},
    'utterances' : ['set volume in {-|ZONE} {to |} {-|RANGE}','set {-|ZONE} volume {to |} {-|RANGE}']
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
          action.setVolume(zone.actionable,prams.range,'range')//Set volume to requested range in all zones
          a.sendAV([zone,'Zone','SetVolume',{'value':prams.range,'type':'set'}]);
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
