const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'channelRecall',
    'version' : '3.0',
    'description' : 'recall a fav channel',
    'enabled' : 1,
    'required' : {
      'resolve': ['zoneWithZone','zoneWithService','channelWithName'],
      'test':{
        '1' : {'scope': 'zone', 'attribute': 'actionable'},
        '2' : {'scope': 'zone', 'attribute': 'speakable'},
        '3' : {'scope': 'channel', 'attribute': 'number'}
      },
      'failMessage': []//['zoneService']
    },
    'voiceMessages' : {
      'success': {}
    },
    'slots' : {'ZONE':'ZONE','ZONE_TWO':'ZONE_TWO','SERVICE':'SERVICE','CHANNEL':"CHANNEL"},
    'utterances' : [
      '{channelAction} {to |} {-|CHANNEL}',
      '{channelAction} {to |} {-|CHANNEL} {in |} {-|ZONE}',
      '{channelAction} {to |} {-|CHANNEL} {in |} {-|ZONE} and {-|ZONE_TWO}',
      '{channelAction} {-|SERVICE} to {-|CHANNEL}',
      '{channelAction} {to |} {-|CHANNEL} on  {-|SERVICE}',
      '{-|CHANNEL}'

    ]
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {
          if (_.get(req.sessionAttributes,'error',{}) === 0){
            var zone = _.get(req.sessionAttributes,'zone',{});
            var service = _.get(req.sessionAttributes,'service',{name:'Zone'});
            var channel = _.get(req.sessionAttributes, 'channel',{});
          }else {
            log.error(intentDictionary.name+' - intent not run verify failed')
            return
          }
          a.sendAV([zone,service.name,"Tune"]);
          return action.channelTune(zone.actionable,channel)
        })
        .then(function(voiceMessage){

          req.data.request.intent.slots.CHANNEL.value = '';//clear CHANNEL slot so we dont get duplicate last command
          req.sessionAttributes.channel = {};

          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'reprompt',voiceMessage))
        })
        .fail(function(err) {
          log.error("err "+err)
          app.intentErr(req,res,err);
        });
    }
    );
  }
  callback(intentDictionary);
};
