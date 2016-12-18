//Intent includes
var matcher = require('../lib/zoneMatcher');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'powerOff',
    'intentVersion' : '1.0',
    'intentDescription' : 'Power off requested zone AV or lighting (lights in a defined AV zone using Savants __RoomSetBrightness workflow)',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('powerOff', {
    		"slots":{"ZONE":"ZONE","LIGHTING":"LIGHTING"}
    		,"utterances":["{actionPrompt} off {-|ZONE}","{actionPrompt} {-|ZONE} off","{actionPrompt} off {-|ZONE} {-|LIGHTING}", "{actionPrompt} {-|LIGHTING} off in {-|ZONE}"]
    	},function(req,res) {
        //Match request to zone then do something
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
              res.say(voiceMessage).send();
              return
          }
          if (req.slot('LIGHTING')){
            //message to send
            var voiceMessage = 'Turning off '+cleanZone+'lights';
            //set dim level
            savantLib.serviceRequest([cleanZone],"lighting","",[0]);
            //inform
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
          }else{
            //message to send
            var voiceMessage = 'Turning off '+cleanZone;
            //Turn off zone
  			    savantLib.serviceRequest([cleanZone,"PowerOff"],"zone");
            //inform
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
          }
        });
  		  return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
