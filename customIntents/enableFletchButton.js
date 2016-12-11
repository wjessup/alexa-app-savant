//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'enableFletchButton',
    'intentVersion' : '1.0',
    'intentDescription' : 'Enable state of amazon IOT button',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('enableFletchButton', {
        "slots":{}
        ,"utterances":["{enablePrompt} {fletch|fletcher |} button"]
      },function(req,res) {
      console.log('enableFletchButton Intent: Fletchers Button is now enabled');
      savantLib.writeState("userDefined.fletchButton",1);
      res.say('Fletchers Button is now enabled').send();
      return false;
      }
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
