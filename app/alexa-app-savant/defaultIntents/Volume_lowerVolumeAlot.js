//Intent includes
var matcher = require('../lib/zoneMatcher');
var action = require('../lib/actionLib');
var cleanZones = [];

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'lowerVolumeAlot',
    'intentVersion' : '1.0',
    'intentDescription' : 'Lower volume for AV zone by a large preset ammount',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('lowerVolumeAlot', {
    		"slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO"}
    		,"utterances":[
          "{decreasePrompt} volume in {-|ZONE} a lot", "Make {-|ZONE} much lower","{-|ZONE} is too loud",
          "{decreasePrompt} volume in {-|ZONE} and {-|ZONE_TWO} a lot", "Make {-|ZONE} and {-|ZONE_TWO} much lower","{-|ZONE} and {-|ZONE_TWO} {is|are} too loud"
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

        //increase volume by 40% in cleanZones
        action.relativeVolume(cleanZones[0],-20);

        //inform
        var voiceMessage = 'Lowering volume alot in '+ cleanZones[1];
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
        return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
