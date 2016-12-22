//Intent includes
var matcher = require('../lib/zoneMatcher');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'setVolumeValue',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set volume for AV zone in percentage',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('setVolumeValue', {
    		"slots":{"VOLUMEVALUE":"NUMBER","ZONE":"ZONE"}
    		,"utterances":["{actionPrompt} volume in {-|ZONE} to {0-100|VOLUMEVALUE} {percent |}","{actionPrompt} {-|ZONE} volume to {0-100|VOLUMEVALUE} {percent |}"]
    	},function(req,res) {
    		//Make sure volume request is between 1-100
    		if (req.slot('VOLUMEVALUE')> 0 ||req.slot('VOLUMEVALUE')<101){
          console.log("Raw Volume request: "+req.slot('VOLUMEVALUE'))
    		  var volumeValue = Math.round(req.slot('VOLUMEVALUE')/2);
        }else {
          var voiceMessage = 'I didnt understand please try again. Say a number between 1 and 100';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
          return
        }
        //Match request to zone then do something
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
              res.say(voiceMessage).send();
              return
          }
          //message to send
          var voiceMessage = "Setting volume to "+req.slot('VOLUMEVALUE')+" in "+ cleanZone;
          //Set Volume
    			savantLib.serviceRequest([cleanZone],"volume","",[volumeValue]);
          //inform
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send()
          return;
        });
    	return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
