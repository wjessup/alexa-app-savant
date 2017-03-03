const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'StartService',
    'version' : '3.0',
    'description' : 'Turn on any service in any AV zone',
    'enabled' : 1,
    'required' : {
      'resolve': ['zoneWithZone','serviceWithService'],
      'test':{
        '1' : {'scope': 'zone', 'attribute': 'actionable'},
        '2' : {'scope': 'zone', 'attribute': 'speakable'},
        '3' : {'scope': 'service', 'attribute': 'serviceArray'}
        }
    },
    'voiceMessages' : {
      'success': 'Turning on {0} in {1}'
    },
    'slots' : {'ZONE':'ZONE','ZONE_TWO':'ZONE_TWO','SERVICE':'SERVICE'},
    'utterances' : [
      '{enablePrompt} {-|SERVICE} in {the |} {-|ZONE}',
      '{enablePrompt} {-|SERVICE} in {the |} {-|ZONE} and {-|ZONE_TWO}',
      '{enablePrompt} {-|ZONE} to {-|SERVICE}',
      '{enablePrompt} {-|ZONE} and {-|ZONE_TWO} to {-|SERVICE}'
    ]
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {//send power command to all found service arrays
          if (_.get(req.sessionAttributes,'error',{}) === 0){
            var zone = _.get(req.sessionAttributes,'zone',{});
            var service = _.get(req.sessionAttributes,'service',{name:'Zone'});
            var command = _.get(req.sessionAttributes, 'command',{});
          }else {
            log.error(intentDictionary.name+' - intent not run verify failed')
            return
          }
          a.sendAV([zone,req.slot('service.name'),'PowerOn'])
          return action.bulkPowerOn(service.serviceArray)
          .thenResolve('Turning on ' + service.name + ' in ' + zone.speakable);
        })
        .then(function(voiceMessage) {//Inform
          log.error (intentDictionary.name+' Intent: '+voiceMessage+' Note: ()');
          res.say(voiceMessage);
        })
        .fail(function(err) {
          app.intentErr(req,res,err);
        });
    }
    );
  }
  callback(intentDictionary);
};
