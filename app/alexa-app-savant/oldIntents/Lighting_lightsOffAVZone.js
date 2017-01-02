//Intent includes
var matcher = require('../lib/zoneMatcher');
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
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["{actionPrompt} off {-|ZONE} lights","{actionPrompt} off lights in {-|ZONE}"]
    	},function(req,res) {
        //Match request to zone then do something
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
              res.say(voiceMessage).send();
              return
          }
          //message to send
          var voiceMessage = 'Turning off '+cleanZone+'lights';
          //set dim level
          savantLib.serviceRequest([cleanZone],"lighting","",[0]);
          //inform
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
