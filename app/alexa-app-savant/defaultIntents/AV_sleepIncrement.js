//Intent includes
var savantLib = require('../lib/savantLib');
var didYouMean = require('didYouMean');

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
        "slots":{"TIMER":"NUMBER","ZONE":"LITERAL"}
        ,"utterances":["add {1-120|TIMER} minutes to {sleep |} timer in {systemZones|ZONE}"]
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
        if (req.slot('TIMER')< 0 ||req.slot('TIMER')>121|| typeof (req.slot('TIMER')) == 'undefined'){
          var voiceMessage = 'I didnt hear how long. Say a time between 1 and 120 minutes';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+' Note: (timer: '+req.slot('TIMER')+')');
          res.say(voiceMessage).send();
          return
        }

        //check if a sleep timer is running in zone
        savantLib.readState(cleanZone+'.SleepTimerActive', function(SleepTimerActive) {
          if (SleepTimerActive == 0){
            var voiceMessage = 'There is no timer set in '+cleanZone;
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
            return
          }

          //start timer
          savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepIncrement","zone",cleanZone,"minutes",req.slot('TIMER')],"full");

          //inform
          var voiceMessage = 'adding '+req.slot('TIMER')+' more minutes in '+cleanZone;
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
