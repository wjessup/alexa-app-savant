const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'setVolumeValue',
    'version' : '3.0',
    'description' : 'Set volume for AV zone in percentage',
    'enabled' : 1,
    'required' : {
      'resolve': ['zoneWithZone','zoneWithService'],
      'test': {
        '1' : {'scope': 'zone', 'attribute': 'actionable'},
        '2' : {'scope': 'zone', 'attribute': 'speakable'}
      }
    },
    'voiceMessages' : {
      'success' : 'Setting volume to {0} in {1}',
      'error':{
        'outOfRange' : 'I didnt understand please try again. Say a number between 1 and 100'
      }
    },
    'slots' : {'VOLUMEVALUE':'NUMBER','ZONE':'ZONE'},
    'utterances' : ['set volume in {-|ZONE} to {0-100|VOLUMEVALUE} {percent |}','set {-|ZONE} volume to {0-100|VOLUMEVALUE} {percent |}']
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function (){
          if (_.get(req.sessionAttributes,'error',{}) === 0){
            var zone = _.get(req.sessionAttributes,'zone',{});
          }else {
            log.error(intentDictionary.name+' - intent not run verify failed')
            return
          }
          value = Number(req.slot('VOLUMEVALUE'));
          if ((value< 1 || value>100) || isNaN(value)){
            throw app.builderErr(intentDictionary.name,'endSession',intentDictionary.voiceMessages.error.outOfRange,'outOfRange')
          }
          action.setVolume(zone.actionable,value,'percent')
          a.sendAV([zone,'Zone','SetVolume',{'value':value,'type':'set'}]);
          return format(intentDictionary.voiceMessages.success,value,zone.speakable)
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
