//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'name' : 'turnOnSanta',
    'version' : '1.0',
    'description' : 'Launch custom workflow making santa fart',
    'enabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.enabled === 1){

//Intent
    app.intent('turnOnSanta', {
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["Turn on santa","make santa talk"]
    	},function(req,res) {
    		savantLib.serviceRequest(["Santa"],"custom");
    		log.error('turnOnSanta Intent: Santa');
    		res.say('').send();
    		return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
