//Intent includes
var matcher = require('../lib/zoneMatcher');
var savantLib = require('../lib/savantLib');
var cleanZones = [];

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'lowerVolume',
    'intentVersion' : '1.0',
    'intentDescription' : 'Lower volume for AV zone by a preset ammount',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('lowerVolume', {
    		"slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO"}
    		,"utterances":[
          "{decreasePrompt} volume in {-|ZONE}", "Make {-|ZONE} lower",
          "{decreasePrompt} volume in {-|ZONE} and {-|ZONE_TWO}", "Make {-|ZONE} and {-|ZONE_TWO} lower"
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
        for (var key in cleanZones){ //lower volume in each requested zone
          savantLib.readState(cleanZones[key]+'.CurrentVolume', function(currentVolume) {
    				//adjust volume
            newVolume = Number(currentVolume)-6
            //set volume
            savantLib.serviceRequest([cleanZones[key]],"volume","",[newVolume]);
  			  });
        }
        //message to send
        if (cleanZones.length>1){//add "and" if more then one zone was requested
          var pos = (cleanZones.length)-1;
          cleanZones.splice(pos,0,"and");
        }
        var voiceMessage = 'Lowering volume in '+ cleanZones;
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
