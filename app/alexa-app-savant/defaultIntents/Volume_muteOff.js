const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'muteOff',
    'intentVersion' : '1.0',
    'intentDescription' : 'Send Mute On to requested zone',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('muteOff', {
    		"slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO","SERVICE":"SERVICE"}
    		,"utterances":[
          "{to |} {send |} unmute {command |}{in |} {-|ZONE}","{-|ZONE} unmute",
          "{to |} {send |} unmute {command |}{in |} {-|ZONE} and {-|ZONE_TWO}","{-|ZONE} and {-|ZONE_TWO} unmute",
          "{to |} unmute {-|SERVICE}","{-|SERVICE} {to |} unmute"
        ]
    	}, function(req,res) {
        if (req.slot('ZONE') === "" || typeof(req.slot('ZONE')) === 'undefined'){
          serviceMatcher.activeServiceNameMatcher(req.slot('SERVICE'))
          .then(function(cleanZones){
            action.muteCommand(cleanZones,'off')//Send mute command to all cleanZones
            return cleanZones
          })
          .then(function(cleanZones) {//Inform
            eventAnalytics.send(intentDictionary.intentName,cleanZones,req.slot('SERVICE'),"MuteOff");
            var voiceMessage = 'Unmute';
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
          action.muteCommand(cleanZones,'off')//Send unmute command to all cleanZones
          return cleanZones
        })
        .then(function(cleanZones) {//Inform
          eventAnalytics.send(intentDictionary.intentName,cleanZones,"Zone","MuteOff");
          var voiceMessage = 'Unmute';
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
