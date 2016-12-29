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
        //Make a zone list (Figure out if its single zone or process requested zones)
        if (currentZone != false){
          cleanZones[0] = currentZone
        } else {
          cleanZones = matcher.zonesMatcher(req.slot('ZONE'),req.slot('ZONE_TWO'), function (err,cleanZones){
            console.log (intentDictionary.intentName+' Intent: '+err+" Note: (Invalid Zone Match, cleanZones: "+cleanZones+")");
            res.say(err).send();
          });
          if (cleanZones.length === 0){
            return
          }
        }

        //Do something with the zone list
        for (var key in cleanZones){ //send play command in each requested zone
          savantLib.serviceRequest([cleanZones[key],"Play"],"zone");
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
