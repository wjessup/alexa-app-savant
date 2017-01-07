//Intent includes
var matcher = require('../lib/zoneMatcher');
var action = require('../lib/actionLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'raiseVolume',
    'intentVersion' : '1.0',
    'intentDescription' : 'Increase volume for AV zone by a preset ammount',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('raiseVolume', {
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["{increasePrompt} volume in {-|ZONE}", "Make {-|ZONE} louder"]
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

        //increase volume by 40% in cleanZones
        action.relativeVolume(cleanZones[0],6);

        //inform
        var voiceMessage = 'Increasing volume in '+ cleanZones[1];
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
      	return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
