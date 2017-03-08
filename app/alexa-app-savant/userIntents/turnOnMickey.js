//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'name' : 'turnOnMickey',
    'version' : '1.0',
    'description' : 'Launch custom workflow starting music in kitchen',
    'enabled' : 0
  };

//Intent Enable/Disable
  if (intentDictionary.enabled === 1){

//Intent
    app.intent('turnOnMickey', {
        "slots":{"ZONE":"ZONE"}
        ,"utterances":["Turn on mickey"]
      },function(req,res) {

        savantLib.serviceRequest(["Lutron_KitchenAV_On"],"custom");

        log.error('turnOnMickey Intent: Turning on Mickey');
        res.say('Turning on Mickey').send();
        return false;
      }
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
