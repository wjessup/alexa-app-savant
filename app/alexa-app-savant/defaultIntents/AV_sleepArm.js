//Intent includes
var savantLib = require('../lib/savantLib');
var didYouMean = require('didYouMean');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'sleepArm',
    'intentVersion' : '1.0',
    'intentDescription' : 'Start a sleep timer with a variable ammount',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('sleepArm', {
        "slots":{"TIMER":"NUMBER","ZONE":"LITERAL"}
        ,"utterances":["{actionPrompt} sleep timer for {1-120|TIMER} minutes in {systemZones|ZONE}","{actionPrompt} sleep timer in {systemZones|ZONE} for {1-120|TIMER} minutes"]
      },function(req,res) {
        //Match request to zone list
        var cleanZone = didYouMean(req.slot('ZONE'), appDictionaryArray);

        //make sure cleanZone exists
        if (typeof cleanZone == 'undefined' || cleanZone == null){
          var voiceMessage = 'I didnt understand which zone you wanted, please try again.';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (cleanZone undefined)");
          res.say(voiceMessage).send();
          return
        }

        //make sure we have a reasonable time
        var timerNumber = Number(req.slot('TIMER'));
        if (timerNumber< 0 ||timerNumber>121 || typeof (timerNumber) == 'undefined'){
          var voiceMessage = 'I didnt hear how long. Say a time between 1 and 120 minutes';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+' Note: (timer: '+timerNumber+')');
          res.say(voiceMessage).send();
          return
        }

        //start timer
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepArm","zone",cleanZone,"minutes",timerNumber],"full");

        //inform
        var voiceMessage = 'Sleep timer set for '+timerNumber+' minutes';
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
        return false;
      }
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
