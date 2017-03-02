const
  _ = require('lodash'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'pauseZone',
    'version' : '3.0',
    'description' : 'Send pause to requested zone',
    'enabled' : 0,
    "required" : {
      "resolve": ["zoneWithZone","zoneWithService"],
      "test":{
        "1" : {"scope": "zone", "attribute": "actionable"},
        "2" : {"scope": "zone", "attribute": "speakable"}
      },
      "failMessage": ["zoneService"]
      }
  };

  if (intentDictionary.enabled === 1){
    app.intent('pauseZone', {
    		"slots": {"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO","SERVICE":"SERVICE"}
    		,"utterances":[
          "{to |} {send |} pause {command |}",
          "{to |} {send |} pause in {-|ZONE}",
          "{to |} {send |} pause {command |} {to |} {-|SERVICE} ",
          "{to |} {send |} pause {command |}{in |} {the |} {-|ZONE}",
          "{to |} {send |} pause {command |}{in |} {the |} {-|ZONE} and {-|ZONE_TWO}",
          "{-|ZONE} and {-|ZONE_TWO} {to |} pause",
          "{to |} pause {-|SERVICE}",
          "{-|ZONE} {to |} pause",
          "{tell |} {-|SERVICE} {to |} pause"
        ]
    	}, function(req,res) {
        var a = new eventAnalytics.event(intentDictionary.name);
        return app.prep(req, res)
          .then(function(req) {
            if (_.has(req,"sessionAttributes")){
              var zone = req.sessionAttributes.zone;
              var service = _.get(req.sessionAttributes, 'service', 'zone');
            }else {
              return
            }
            action.serviceCommand(zone.actionable,"Pause")//Send pause command actionable zones
            var voiceMessage = 'Pause';
            log.error (intentDictionary.name+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage);
            a.sendAV([zone,service.name,"Pause"]);
          })
          .fail(function(voiceMessage) {//service could not be found
            log.error (intentDictionary.name+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage);
          });
      }
    );
  }
  callback(intentDictionary);
};
