const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'sleepDisarm',
    'version' : '3.0',
    'description' : 'Stop a sleep timer in a zone',
    'enabled' : 1,
    'required' : {
      'resolve': ['zoneWithZone'],
      'test':{
        '1' : {'scope': 'zone', 'attribute': 'actionable'},
        '2' : {'scope': 'zone', 'attribute': 'speakable'}
      },
      'failMessage': []
    },
    'voiceMessages' : {
      'success': 'Disabling timer in {0}',
      'error':{}
    },
    'slots' : {'ZONE':'ZONE'},
    'utterances' : ['{Stop|disable} {sleep |} timer in {-|ZONE}']
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {
          if (_.get(req.sessionAttributes,'error',{}) === 0){
            var zone = _.get(req.sessionAttributes,'zone',{});
          }else {
            log.error(intentDictionary.name+' - intent not run verify failed')
            return
          }
          action.sleepTimer(zone,'','disarm')
          a.sendSleep([zone,'dis_sleepDisarm']);
          return format(intentDictionary.voiceMessages.success,zone.speakable)
        })
        .then(function(voiceMessage) {
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
