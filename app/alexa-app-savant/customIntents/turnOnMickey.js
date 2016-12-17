//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'turnOnMickey',
    'intentVersion' : '1.0',
    'intentDescription' : 'Launch custom workflow starting music in kitchen',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('turnOnMickey', {
        "slots":{"ZONE":"ZONE"}
        ,"utterances":["Turn on mickey"]
      },function(req,res) {

        savantLib.serviceRequest(["Lutron_KitchenAV_On"],"custom");

        console.log('turnOnMickey Intent: Turning on Mickey');
        res.say('Turning on Mickey').send();
        return false;
      }
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
