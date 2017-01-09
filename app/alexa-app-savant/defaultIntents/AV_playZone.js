const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'playZone',
    'intentVersion' : '1.0',
    'intentDescription' : 'Send play to requested zone',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('playZone', {
    		"slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO"}
    		,"utterances":[
          "{to |} {send |} play {command |}",
          "{to |} {send |} play {command |}{in |} {the |} {-|ZONE}","{-|ZONE} {to |} play",
          "{to |} {send |} play {command |}{in |} {the |} {-|ZONE} and {-|ZONE_TWO}","{-|ZONE} and {-|ZONE_TWO} {to |} play"
        ]
    	}, function(req,res) {
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          action.playCommand(cleanZones)//Send pause command to all cleanZones
          return cleanZones
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Play';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        })
        .fail(function(voiceMessage) {//Zone could not be found
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        });
      return false;
    	}
    );
  }
  callback(intentDictionary);
};
