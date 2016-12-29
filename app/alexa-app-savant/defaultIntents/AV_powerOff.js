//Intent includes
var matcher = require('../lib/zoneMatcher');
var savantLib = require('../lib/savantLib');
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
        if (req.slot('LIGHTING')){ //if lighting lights or light was heard, run lighting worklow
          //set dim level
          for (var key in cleanZones){
            savantLib.serviceRequest([cleanZones[key]],"lighting","",[0]);
          }
          //message to send
          if (cleanZones.length>1){//add "and" if more then one zone was requested
            var pos = (cleanZones.length)-1;
            cleanZones.splice(pos,0,"and");
          }
          var voiceMessage = 'Turning off '+cleanZones;
          //inform
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();

        }else{ // Do AV action (Lighting was not heard)

          //Turn off zone
          console.log ("cleanZones3: "+cleanZones);
          for (var key in cleanZones){
            console.log("sending service request")
            savantLib.serviceRequest([cleanZones[key],"PowerOff"],"zone");
          }
          //message to send
          if (cleanZones.length>1){//add "and" if more then one zone was requested
            var pos = (cleanZones.length)-1;
            cleanZones.splice(pos,0,"and");
          }
          var voiceMessage = 'Turning off '+cleanZones;
          //inform
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        }
  		  return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
