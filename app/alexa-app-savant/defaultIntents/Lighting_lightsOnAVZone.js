//Intent includes
var matcher = require('../lib/zoneMatcher');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'lightsOnAVZone',
    'intentVersion' : '1.0',
    'intentDescription' : 'Turn on lights in a defined AV zone using Savants __RoomSetBrightness workflow',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('lightsOnAVZone', {
    		"slots":{"ZONE":"LITERAL"}
    		,"utterances":["{turn|switch} on {systemZones|ZONE} lights","{turn|switch} on lights in {systemZones|ZONE}"]
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
          var voiceMessage = 'Turning on '+cleanZone+'lights';
          //set dim level
          savantLib.serviceRequest([cleanZone],"lighting","",[100]);
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
