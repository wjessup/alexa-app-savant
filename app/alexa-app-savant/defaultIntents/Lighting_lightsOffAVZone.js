//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'lightsOffAVZone',
    'intentVersion' : '1.0',
    'intentDescription' : 'Turn off lights in a defined AV zone using Savants __RoomSetBrightness workflow',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('lightsOffAVZone', {
    		"slots":{"ZONE":"LITERAL"}
    		,"utterances":["{actionPrompt} off {systemZones|ZONE} lights","{actionPrompt} off lights in {systemZones|ZONE}"]
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

        //set dim level
        savantLib.serviceRequest([cleanZone],"lighting","",[0]);

        //inform
        var voiceMessage = 'Turning off '+cleanZone+'lights';
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (cleanZone undefined)");
        res.say(voiceMessage).send();
    	return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
