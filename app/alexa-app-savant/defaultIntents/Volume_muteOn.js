const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'muteOn',
    'intentVersion' : '1.0',
    'intentDescription' : 'Send Mute On to requested zone',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('muteOn', {
    		"slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO","SERVICE":"SERVICE"}
    		,"utterances":[
          "{to |} {send |} mute {command |}{in |} {-|ZONE}","{-|ZONE} mute",
          "{to |} {send |} mute {command |}{in |} {-|ZONE} and {-|ZONE_TWO}","{-|ZONE} and {-|ZONE_TWO} mute",
          "{to |} mute {-|SERVICE}","{-|SERVICE} {to |} mute"
        ]
    	}, function(req,res) {
        if (req.slot('ZONE') === "" || typeof(req.slot('ZONE')) === 'undefined'){
          serviceMatcher.activeServiceNameMatcher(req.slot('SERVICE'))
          .then(function(cleanZones){
            action.muteCommand(cleanZones,'on')//Send mute command to all cleanZones
            return cleanZones
          })
          .then(function(cleanZones) {//Inform
            var voiceMessage = 'Mute';
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
          action.muteCommand(cleanZones,'on')//Send mute command to all cleanZones
          return cleanZones
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Mute';
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
