//Intent includes
var matcher = require('../lib/zoneMatcher');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'primaryZoneDeclare',
    'intentVersion' : '1.0',
    'intentDescription' : 'tell alexa what zone you are in',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('primaryZoneDeclare', {
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["I am in {-|ZONE}","set zone to {-|ZONE}"]
    	},function(req,res) {
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              var voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
              res.say(voiceMessage).send();
              return
          }
          currentZone = cleanZone;
          savantLib.writeState("userDefined.currentZone",currentZone);
          var voiceMessage = "Setting location to "+currentZone;
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
