//Intent includes
var matcher = require('../lib/zoneMatcher');
var action = require('../lib/actionLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'setVolumeValue',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set volume for AV zone in percentage',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('setVolumeValue', {
    		"slots":{"VOLUMEVALUE":"NUMBER","ZONE":"ZONE"}
    		,"utterances":["{actionPrompt} volume in {-|ZONE} to {0-100|VOLUMEVALUE} {percent |}","{actionPrompt} {-|ZONE} volume to {0-100|VOLUMEVALUE} {percent |}"]
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

        //Make sure volume request is between 1-100
        var value = Number(req.slot('VOLUMEVALUE'));
        if (value> 0 ||value<101){
          console.log("Raw Volume request: "+value)
          var volumeValue = Math.round(value/2);
        }else {
          var voiceMessage = 'I didnt understand please try again. Say a number between 1 and 100';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
          return
        }

        //Set Volume by percent in all cleanZones
        action.setVolume(cleanZones[0],value, function (err){
          if (err){
            console.log (intentDictionary.intentName+' Intent: '+err+" Note: ()");
            res.say(err).send();
            return
          }
        });

        //inform
        var voiceMessage = 'Setting volume to '+value+' percent in '+cleanZones[1];
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
    	  return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
