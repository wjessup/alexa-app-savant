//Intent includes
var matcher = require('../lib/zoneMatcher');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'lightsOffAVZoneGlobal',
    'intentVersion' : '1.0',
    'intentDescription' : 'Turn off lights in a defined AV zone using Savants __RoomSetBrightness workflow',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('lightsOffAVZoneGlobal', {
    		"slots":{}
    		,"utterances":["{actionPrompt} off all lights","{actionPrompt} off lights in all zones"]
    	},function(req,res) {
      //set dim level
      savantLib.serviceRequest("","lighting","",[0]);

      //inform
      var voiceMessage = 'Turning off all zones';
      console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (cleanZone undefined)");
      res.say(voiceMessage).send();
    	return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
