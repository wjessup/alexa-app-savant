//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'name' : 'powerOff_FirstFloor',
    'version' : '1.0',
    'description' : 'Power off multiple known zone',
    'enabled' : 0
  };

//Intent Enable/Disable
  if (intentDictionary.enabled === 1){

//Intent
    app.intent('powerOff_FirstFloor', {
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["{actionPrompt} off first floor"]
    	},function(req,res) {
  			log.error('Power Off Intent: Turning off first floor');
  			savantLib.serviceRequest(["Kitchen","PowerOff"],"zone");
        savantLib.serviceRequest(["Family Room","PowerOff"],"zone");
        savantLib.serviceRequest(["Living Room","PowerOff"],"zone");
        savantLib.serviceRequest(["Dining Room","PowerOff"],"zone");
  			res.say('Turning off first floor').send();
    		return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
