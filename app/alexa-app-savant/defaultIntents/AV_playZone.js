//Intent includes
var matcher = require('../lib/zoneMatcher');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'playZone',
    'intentVersion' : '1.0',
    'intentDescription' : 'Send play to requested zone',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('playZone', {
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["{to |} {send |} play {command |}{in |} {the |} {-|ZONE}","{-|ZONE} {to |} play"]
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
          var voiceMessage = 'Play';
          //send play command
          savantLib.serviceRequest([cleanZone,"Play"],"zone");
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
