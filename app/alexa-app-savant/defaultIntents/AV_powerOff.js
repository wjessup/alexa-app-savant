//Intent includes
var matcher = require('../lib/zoneMatcher');
var action = require('../lib/actionLib');
var _ = require('lodash');
var cleanZones = [];
//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'powerOff',
    'intentVersion' : '1.0',
    'intentDescription' : 'Power off requested zone AV or lighting (lights in a defined AV zone using Savants __RoomSetBrightness workflow)',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('powerOff', {
    		"slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO","LIGHTING":"LIGHTING"}
    		,"utterances":[
          "{actionPrompt} off",
          "{actionPrompt} off {-|ZONE}","{actionPrompt} {-|ZONE} off","{actionPrompt} {-|ZONE} and {-|ZONE_TWO} off",
          "{actionPrompt} off {-|LIGHTING}",
          "{actionPrompt} off {-|ZONE} {-|LIGHTING}","{actionPrompt} off {-|ZONE} and {-|ZONE_TWO} {-|LIGHTING}",
          "{actionPrompt} {-|LIGHTING} off in {-|ZONE}","{actionPrompt} {-|LIGHTING} off in {-|ZONE} and {-|ZONE_TWO}"
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

        //Do something with cleanZones
        if (req.slot('LIGHTING')){ //if lighting lights or light was heard, run lighting worklow
          action.setLighting(cleanZones[0],0);
          var voiceMessage = 'Turning off lights in '+ cleanZones[1];

        }else{ // Do AV action (Lighting was not heard)
          action.powerOffAV(cleanZones[0]);
          var voiceMessage = 'Turning off '+cleanZones[1];
        }

        //Inform
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
  		  return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
