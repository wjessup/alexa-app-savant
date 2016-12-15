//Intent includes
var savantLib = require('../lib/savantLib');
var didYouMean = require('didYouMean');

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
        "slots":{"ZONE":"LITERAL"}
        ,"utterances":["{Stop|disable} {sleep |} timer in {systemZones|ZONE}"]
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

        //Stop timer
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepDisarm","zone",cleanZone],"full");

        //inform
        var voiceMessage = 'Sleep timer disabled in '+cleanZone;
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
        return false;
      }
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
