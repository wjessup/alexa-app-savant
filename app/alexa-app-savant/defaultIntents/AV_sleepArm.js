const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'sleepArm',
    'version' : '3.0',
    'description' : 'Start a sleep timer with a variable ammount',
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
      'success': 'Starting timer for {0} minutes in {1}',
      'error':{
        'timeMissing' : 'for how long?',
        'outOfRange' : 'I didnt understand please try again. Say a number between 1 and 120'
      }
    },
    'slots' : {'TIMER':'NUMBER','ZONE':'ZONE'},
    'utterances' : ['{actionPrompt} sleep timer for {1-120|TIMER} minutes in {-|ZONE}','{actionPrompt} sleep timer in {-|ZONE} for {1-120|TIMER} minutes',
      'set a sleep timer', '{1-120|TIMER} minutes']
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

          if (!req.slot('TIMER')){
            throw app.builderErr(intentDictionary.name,'reprompt',intentDictionary.voiceMessages.error.timeMissing,'timeMissing')
          }
          value = Number(req.slot('TIMER'));
          if ((value< 1 || value>121)){
            throw app.builderErr(intentDictionary.name,'endSession',intentDictionary.voiceMessages.error.outOfRange,'outOfRange')
          }



          action.sleepTimer(zone.actionable,value,'arm');
          a.sendSleep([zone,'dis_sleepArm',value]);
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
