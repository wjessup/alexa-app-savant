//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'lightsOnValue',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set lighting for AV zone to a percentage',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('lightsOnValue', {
    		"slots":{"PERCENTAGE":"NUMBER","ZONE":"LITERAL"}
    		,"utterances":["{actionPrompt} lights in {systemZones|ZONE} to {0-100|PERCENTAGE} {percent |}","{actionPrompt} {systemZones|ZONE} lights to {0-100|PERCENTAGE} {percent |}"]
    	},function(req,res) {
    		//Make sure volume request is between 1-100
    		if (req.slot('PERCENTAGE')> 0 ||req.slot('PERCENTAGE')<101|| req.slot('PERCENTAGE') == null|| typeof(req.slot('PERCENTAGE')) == 'undefined' ){
          console.log("Raw Lighting request: "+req.slot('PERCENTAGE'))
        }else {
          var voiceMessage = 'I didnt understand please try again. Say a number between 1 and 100';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
          return
        }
        //Match request to zone list
        var cleanZone = didYouMean(req.slot('ZONE'), appDictionaryArray);

        //make sure cleanZone exists
        if (typeof cleanZone == 'undefined' || cleanZone == null){
          var voiceMessage = 'I didnt understand which zone you wanted, please try again.';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (cleanZone undefined)");
          res.say(voiceMessage).send();
          return
        }

    		//Set Lighting
  			savantLib.serviceRequest([cleanZone],"lighting","",[req.slot('PERCENTAGE')]);

        //inform
        var voiceMessage = "Setting lights to to "+req.slot('PERCENTAGE')+" percent in "+ cleanZone;
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
    	return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
