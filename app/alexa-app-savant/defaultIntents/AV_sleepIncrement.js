//Intent includes
var savantLib = require('../lib/savantLib');
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
        //Match request to zone then do something
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+' Note: (Invalid Zone Match)');
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

          //check if a sleep timer is running in zone
          savantLib.readState(cleanZone+'.SleepTimerActive', function(SleepTimerActive) {
            if (SleepTimerActive == 0){
              var voiceMessage = 'There is no timer set in '+cleanZone;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
              res.say(voiceMessage).send();
              return
            }

            //start timer
            savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepIncrement","zone",cleanZone,"minutes",timerNumber],"full");

            //inform
            var voiceMessage = 'adding '+timerNumber+' more minutes in '+cleanZone;
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
          });
        });
      return false;
      }
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
