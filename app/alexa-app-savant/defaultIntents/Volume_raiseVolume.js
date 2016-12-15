//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

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
    		"slots":{"ZONE":"LITERAL"}
    		,"utterances":["{increasePrompt} volume in {systemZones|ZONE}", "Make {systemZones|ZONE} louder"]
    	},function(req,res) {
        //Match request to zone list
        var cleanZone = didYouMean(req.slot('ZONE'), appDictionaryArray);

        //make sure cleanZone exists
        if (typeof cleanZone == 'undefined' || cleanZone == null){
          var voiceMessage = 'I didnt understand which zone you wanted, please try again.';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (cleanZone undefined)");
          res.say(voiceMessage).send();
          return
        }

  			savantLib.readState(cleanZone+'.CurrentVolume', function(currentVolume) {
  				//adjust volume
          newVolume = Number(currentVolume)+6

          //set volume
          savantLib.serviceRequest([cleanZone],"volume","",[newVolume]);

          //inform
          var voiceMessage = 'Increasing volume in '+ cleanZone;
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
  			});
    	return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
