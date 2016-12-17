//Intent includes
var savantLib = require('../lib/savantLib');
var matcher = require('../lib/zoneMatcher');

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
        //Match request to zone then do something
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
              res.say(voiceMessage).send();
              return
          }
          //message to send
          var voiceMessage = 'Sleep timer set for '+timerNumber+' minutes';
          //start timer
          savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepArm","zone",cleanZone,"minutes",timerNumber],"full");
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
