const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'pauseZone',
    'intentVersion' : '1.0',
    'intentDescription' : 'Send pause to requested zone',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('pauseZone', {
    		"slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO","SERVICE":"SERVICE"}
    		,"utterances":[
          "{to |} {send |} pause {command |}",
          "{to |} {send |} pause {command |}{in |} {-|ZONE}","{-|ZONE} pause",
          "{to |} {send |} pause {command |}{in |} {-|ZONE} and {-|ZONE_TWO}","{-|ZONE} and {-|ZONE_TWO} pause",
          "{to |} pause {-|SERVICE}",
        ]
    	}, function(req,res) {
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          if (req.slot('ZONE') === "" || typeof(req.slot('ZONE')) === 'undefined'){
            action.pauseCommand(cleanZones)//Send pause command to all cleanZones
            return cleanZones
          }else{
            
          }
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Pause';
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
