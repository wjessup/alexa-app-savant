const
  _ = require('lodash'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'playZone',
    'version' : '3.0',
    'description' : 'Send play to requested zone',
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
    app.intent('playZone', {
    		"slots": {"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO","SERVICE":"SERVICE"}
    		,"utterances":[
          "{to |} {send |} play {command |}",
          "{to |} {send |} play in {-|ZONE}",
          "{to |} {send |} play {command |} {to |} {-|SERVICE} ",
          "{to |} {send |} play {command |}{in |} {the |} {-|ZONE}",
          "{to |} {send |} play {command |}{in |} {the |} {-|ZONE} and {-|ZONE_TWO}",
          "{-|ZONE} and {-|ZONE_TWO} {to |} play",
          "{to |} play {-|SERVICE}",
          "{-|ZONE} {to |} play",
          "{tell |} {-|SERVICE} {to |} play"
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
            action.serviceCommand(zone.actionable,"Play")//Send pause command actionable zones
            var voiceMessage = 'Play';
            log.error (intentDictionary.name+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage);
            a.sendAV([zone,service.name,"Play"]);
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
