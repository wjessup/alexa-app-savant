const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  serviceMatcher = require('../lib/serviceMatcher');

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
          "{to |} pause {-|SERVICE}"
        ]
    	}, function(req,res) {
        if (req.slot('ZONE') === "" || typeof(req.slot('ZONE')) === 'undefined'){
          serviceMatcher.activeServiceNameMatcher(req.slot('SERVICE'))
          .then(function(cleanZones){
            action.serviceCommand(cleanZones,"Pause")//Send pause command to only one found zone
            return cleanZones
          })
          .then(function(cleanZones) {//Inform
            var voiceMessage = 'Pause';
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
          })
          .fail(function(voiceMessage) {//service could not be found
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
          });
          return false
        }
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          action.serviceCommand(cleanZones,"Pause")//Send pause command to all cleanZones
          return cleanZones
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
