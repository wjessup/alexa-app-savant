//Intent includes
var matcher = require('../lib/matchers/zone');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'name' : 'lightsOffAVZone',
    'version' : '1.0',
    'description' : 'Turn off lights in a defined AV zone using Savants __RoomSetBrightness workflow',
    'enabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.enabled === 1){
    //Intent
    app.intent('lightsOffAVZone', {
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["{actionPrompt} off {-|ZONE} lights","{actionPrompt} off lights in {-|ZONE}"]
    	},function(req,res) {
        //Match request to zone then do something
        matcherZone.single((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              voiceMessage = err;
              log.error (intentDictionary.name+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
              res.say(voiceMessage).send();
              return
          }
          //message to send
          var voiceMessage = 'Turning off '+cleanZone+'lights';
          //set dim level
          savantLib.serviceRequest([cleanZone],"lighting","",[0]);
          //inform
          log.error (intentDictionary.name+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        });
    	  return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
