const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  savantLib = require('../lib/savantLib'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'AV_sleepQuery',
    'version' : '3.0',
    'description' : 'get SleepTimerRemainingTime from zone sleep timer',
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
      'success': '{0} timer has about {1} minutes left',
      'error':{
        'timerNotset' : '{0} timer is not set'
      }
    },
    'slots' : {'ZONE':'ZONE'},
    'utterances' : ['how much time is left in {-|ZONE}','how much longer in {-|ZONE}','how much time is left on the sleep timer in {-|ZONE}']
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
          return savantLib.readStateQ(zone.actionable[0]+'.SleepTimerRemainingTime')
          .then(function(stateValue){
            if (stateValue === ''){
              throw app.builderErr(intentDictionary.name,'endSession',format(intentDictionary.voiceMessages.error.timerNotset,zone.actionable[0]),'timerNotset')
              a.sendError('AV_sleepQuery Timer not set in: '+ zone.actionable[0]);
            } else{
              var minSec = stateValue.split(':')
              var minLeft = minSec[0];
              minLeft = minLeft.replace(/^[0\.]+/, '');
              if (minSec[1]>30){
                minLeft = Number(minLeft)+1
              }
              a.sendSleep([zone,'SleepTimerRemainingTime',minLeft]);
              return format(intentDictionary.voiceMessages.success,zone.speakable[0],minLeft)
            }
          })
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
