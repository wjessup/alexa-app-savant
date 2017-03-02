const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'sleepIncrement',
    'version' : '3.0',
    'description' : 'Extend sleep timer with a variable ammount',
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
      'success': 'Adding {0} more minutes in {1}',
      'error':{
        'outOfRange' : 'I didnt understand please try again. Say a number between 1 and 120'
      }
    },
    'slots' : {'TIMER':'NUMBER','ZONE':'ZONE'},
    'utterances' : ['add {1-120|TIMER} minutes to {sleep |} timer in {-|ZONE}']
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
          value = Number(req.slot('TIMER'));
          if ((value< 1 || value>121) || isNaN(value)){
            throw app.builderErr(intentDictionary.name,'endSession',intentDictionary.voiceMessages.error.outOfRange,'outOfRange')
          }
          action.sleepTimer(zone.actionable,value,'increment');
          a.sendSleep([zone,'dis_sleepIncrement',value]);
          return format(intentDictionary.voiceMessages.success,value,zone.speakable)
        })
        .then(function(voiceMessage) {
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',voiceMessage))
        })
        .fail(function(err) {
          app.intentErr(req,res,err);
        });
    }
    );
  callback(intentDictionary);
  }
};
