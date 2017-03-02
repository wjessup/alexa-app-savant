const
  matcher = require('../lib/matchers/zone'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'muteOn',
    'version' : '1.0',
    'description' : 'Send Mute On to requested zone',
    'enabled' : 1
  };

  if (intentDictionary.enabled === 1){
    app.intent('muteOn', {
    		"slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO","SERVICE":"SERVICE"}
    		,"utterances":[
          "{to |} {send |} mute {command |}{in |} {-|ZONE}","{-|ZONE} mute",
          "{to |} {send |} mute {command |}{in |} {-|ZONE} and {-|ZONE_TWO}","{-|ZONE} and {-|ZONE_TWO} mute",
          "{to |} mute {-|SERVICE}","{-|SERVICE} {to |} mute"
        ]
    	}, function(req,res) {
        var a = new eventAnalytics.event(intentDictionary.name);
        if (req.slot('ZONE') === "" || typeof(req.slot('ZONE')) === 'undefined'){
          serviceMatcher.activeServiceNameMatcher(req.slot('SERVICE'))
          .then(function(cleanZones){
            action.muteCommand(cleanZones,'on')//Send mute command to all cleanZones
            return cleanZones
          })
          .then(function(cleanZones) {//Inform
            var voiceMessage = 'Mute';
            console.log (intentDictionary.name+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
            a.sendAV([cleanZones,req.slot('SERVICE'),"MuteOn"]);
          })
          .fail(function(voiceMessage) {//service could not be found
            console.log (intentDictionary.name+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
          });
          return false
        }
        matcher.multi(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          action.muteCommand(cleanZones,'on')//Send mute command to all cleanZones
          return cleanZones
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Mute';
          console.log (intentDictionary.name+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
          a.sendAV([cleanZones,"Zone","MuteOn"]);
        })
        .fail(function(voiceMessage) {//Zone could not be found
          console.log (intentDictionary.name+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        });
      return false;
      }
    );
  }
  callback(intentDictionary);
};
