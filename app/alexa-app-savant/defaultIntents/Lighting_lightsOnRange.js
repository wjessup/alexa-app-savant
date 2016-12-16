//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'lightsOnRange',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set lighting for AV zone with high med low presets',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('lightsOnRange', {
    		"slots":{"RANGE":"LITERAL","ZONE":"LITERAL"}
    		,"utterances":["set {systemZones|ZONE} lights {to |} {rangePrompt|RANGE}"]
    	},function(req,res) {
    		console.log("Received range: "+ req.slot('RANGE'));
        //Match request to zone list
        var cleanZone = didYouMean(req.slot('ZONE'), appDictionaryArray);

        //make sure cleanZone exists
        if (typeof cleanZone == 'undefined' || cleanZone == null){
          var voiceMessage = 'I didnt understand what zone wanted, please try again.';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (cleanZone undefined)");
          res.say(voiceMessage).send();
          return
        }

        //set volume scale
  			switch (req.slot('RANGE').toLowerCase()){
  				case "high":
  					savantLib.serviceRequest([cleanZone],"lighting","",[100]);
  				  break;
  				case "medium":
  					savantLib.serviceRequest([cleanZone],"lighting","",[50]);
  				  break;
  				case "low":
  					savantLib.serviceRequest([cleanZone],"lighting","",[25]);
  				  break;
          default:
            var voiceMessage = 'I didnt understand please try again. Say High,Medium,or Low';
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
      			return false;
    			  break;
  			}
        //inform
        var voiceMessage = 'Setting '+cleanZone+' lights to '+req.slot('RANGE');
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
    	return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
