//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

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
    		"slots":{"ZONE":"LITERAL"}
    		,"utterances":["{decreasePrompt} volume in {systemZones|ZONE} a lot", "Make {systemZones|ZONE} much lower","{systemZones|ZONE} is too loud"]
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
          newVolume = Number(currentVolume)-20

          //set volume
          savantLib.serviceRequest([cleanZone],"volume","",[newVolume]);

          //inform
          var voiceMessage = 'Lowering volume a lot in '+ cleanZone;
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
