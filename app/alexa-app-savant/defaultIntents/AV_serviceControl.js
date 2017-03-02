const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'serviceControl',
    'version' : '3.0',
    'description' : 'Send AV command to requested zone',
    'enabled' : 1,
    'required' : {
      'resolve': ['zoneWithZone','zoneWithService','commandWithCommand'],
      'test':{
        '1' : {'scope': 'zone', 'attribute': 'actionable'},
        '2' : {'scope': 'zone', 'attribute': 'speakable'},
        '3' : {'scope': 'command', 'attribute': 'avCommand'}
      },
      'failMessage': []//['zoneService']
    },
    'voiceMessages' : {
      'success': {}
    },
    'slots' : {'ZONE':'ZONE','ZONE_TWO':'ZONE_TWO','SERVICE':'SERVICE','COMMANDREQ':'COMMANDREQ'},
    'utterances' : [
      '{to |} control {-|SERVICE}',
      '{to |} control {-|ZONE}',
      '{-|COMMANDREQ}',
      '{to |} {-|COMMANDREQ} in {-|ZONE}',
      '{to |} {-|COMMANDREQ} {-|ZONE}',
      '{to |} {send |} {-|COMMANDREQ} {command |}',
      '{to |} {send |} {-|COMMANDREQ} in {-|ZONE}',
      '{to |} {send |} {-|COMMANDREQ} {command |} {to |} {-|SERVICE} ',
      '{to |} {send |} {-|COMMANDREQ} {command |}{in |} {the |} {-|ZONE}',
      '{to |} {send |} {-|COMMANDREQ} {command |}{in |} {the |} {-|ZONE} and {-|ZONE_TWO}',
      '{-|ZONE} and {-|ZONE_TWO} {to |} {-|COMMANDREQ}',
      '{to |} {-|COMMANDREQ} {-|SERVICE}',
      '{-|ZONE} {to |} {-|COMMANDREQ}'
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
            var command = _.get(req.sessionAttributes, 'command',{});
          }else {
            log.error(intentDictionary.name+' - intent not run verify failed')
            return
          }
          action.serviceCommand(zone.actionable,command.avCommand)//Send command to actionable zones
          if (!app.isReprompt(req)){
            var voiceMessage = req.slot('COMMANDREQ');
          }else{
            var voiceMessage = 'ok';
          }

          req.data.request.intent.slots.COMMANDREQ.value = '';//clear COMMANDREQ slot so we dont get duplicate last command
          req.sessionAttributes.command = {};
          
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'reprompt',voiceMessage))
          a.sendAV([zone,service.name,command.avCommand]);
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
