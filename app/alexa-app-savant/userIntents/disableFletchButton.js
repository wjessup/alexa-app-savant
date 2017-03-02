//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'name' : 'disableFletchButton',
    'version' : '1.0',
    'description' : 'Disable state of amazon IOT button',
    'enabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.enabled === 1){

//Intent
    app.intent('disableFletchButton', {
    		"slots":{}
    		,"utterances":["{disablePrompt} {fletch|fletcher |} button"]
    	},function(req,res) {
    		log.error('disableFletchButton Intent: Fletchers Button is now disabled');
    		savantLib.writeState("userDefined.fletchButton",0);
    		res.say('Fletchers Button is now disabled').send();
    		return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
