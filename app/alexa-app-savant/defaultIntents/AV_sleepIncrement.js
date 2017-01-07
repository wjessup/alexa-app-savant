//Intent includes
var action = require('../lib/actionLib');
var matcher = require('../lib/zoneMatcher');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'sleepIncrement',
    'intentVersion' : '1.0',
    'intentDescription' : 'Start a sleep timer with a variable ammount',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('sleepIncrement', {
        "slots":{"TIMER":"NUMBER","ZONE":"ZONE"}
        ,"utterances":["add {1-120|TIMER} minutes to {sleep |} timer in {-|ZONE}"]
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

        //Validate requested time
        var value = Number(req.slot('TIMER'));
        if (value< 1 ||value>121 || typeof (value) == 'undefined'){
          var voiceMessage = 'I didnt hear how long. Say a time between 1 and 120 minutes';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+' Note: (timer: '+timerNumber+')');
          res.say(voiceMessage).send();
          return
        }

        //start timer
        action.sleepTimer(cleanZones[0],"increment",value);

        //inform
        var voiceMessage = 'Adding '+value+' more minutes in '+cleanZones[1];
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
        return false;
      }
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
