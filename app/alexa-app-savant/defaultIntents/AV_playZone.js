//Intent includes
var matcher = require('../lib/zoneMatcher');
var savantLib = require('../lib/savantLib');
var cleanZones = [];

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'playZone',
    'intentVersion' : '1.0',
    'intentDescription' : 'Send play to requested zone',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('playZone', {
    		"slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO"}
    		,"utterances":[
          "{to |} {send |} play {command |}",
          "{to |} {send |} play {command |}{in |} {the |} {-|ZONE}","{-|ZONE} {to |} play",
          "{to |} {send |} play {command |}{in |} {the |} {-|ZONE} and {-|ZONE_TWO}","{-|ZONE} and {-|ZONE_TWO} {to |} play"
        ]
    	},function(req,res) {
        //Get clean zones, fail if we cant find a match
        var cleanZones = matcher.zonesMatcher(req.slot('ZONE'),req.slot('ZONE_TWO'), function (err,cleanZones){
          voiceMessage = err;
          voiceMessageNote = "(Invalid Zone Match, cleanZones: "+cleanZones+")";
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ("+voiceMessageNote+")");
          res.say(voiceMessage).send();
        });
        if (cleanZones[0].length === 0){
          return
        }

        //Do something with the zone list
        for (var key in cleanZones[0]){ //send play command in each requested zone
          savantLib.serviceRequest([cleanZones[0][key],"Play"],"zone");
        }
        //message to send
        var voiceMessage = 'Play';
        //inform
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();

        return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
