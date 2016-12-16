//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'powerOff_FirstFloor',
    'intentVersion' : '1.0',
    'intentDescription' : 'Power off multiple known zone',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('powerOff_FirstFloor', {
    		"slots":{"ZONE":"LITERAL"}
    		,"utterances":["{actionPrompt} off first floor"]
    	},function(req,res) {
  			console.log('Power Off Intent: Turning off first floor');
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