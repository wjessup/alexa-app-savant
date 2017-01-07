//Intent includes
var action = require('../lib/actionLib');
var matcher = require('../lib/zoneMatcher');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'sleepDisarm',
    'intentVersion' : '1.0',
    'intentDescription' : 'Stop a sleep timer in a zone',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('sleepDisarm', {
        "slots":{"ZONE":"ZONE"}
        ,"utterances":["{Stop|disable} {sleep |} timer in {-|ZONE}"]
      },function(req,res) {
        //Get clean zones, fail if we cant find a match
        var cleanZones = matcher.zonesMatcher(req.slot('ZONE'),req.slot('ZONE_TWO'), function (err,cleanZones){
          voiceMessage = err;
          voiceMessageNote = "(Invalid Zone Match, cleanZones: "+cleanZones+")";
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ("+voiceMessageNote+")");
          res.say(voiceMessage).send();
        });
        if (cleanZones[0].length === 0){
          return
        }

        //start timer
        action.sleepTimer(cleanZones[0],"disarm");

        //inform
        var voiceMessage = 'Disabling timer in in '+cleanZones[1];
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
        return false;
      }
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
