//Intent includes
var savantLib = require('../lib/savantLib');
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
        //Match request to zone then do something
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
              res.say(voiceMessage).send();
              return
          }
          //message to send
          var voiceMessage = 'Sleep timer disabled in '+cleanZone;
          //Stop timer
          savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepDisarm","zone",cleanZone],"full");
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
