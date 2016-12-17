//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'turnOnSanta',
    'intentVersion' : '1.0',
    'intentDescription' : 'Launch custom workflow making santa fart',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('turnOnSanta', {
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["Turn on santa","make santa talk"]
    	},function(req,res) {
    		savantLib.serviceRequest(["Santa"],"custom");
    		console.log('turnOnSanta Intent: Santa');
    		res.say('').send();
    		return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
