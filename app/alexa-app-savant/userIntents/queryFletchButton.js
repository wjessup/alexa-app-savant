//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'name' : 'queryFletchButton',
    'version' : '1.0',
    'description' : 'Query state of amazon IOT button',
    'enabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.enabled === 1){

//Intent
    app.intent('queryFletchButton', {
    		"slots":{}
    		,"utterances":["is {fletchs|fletchers |} button {enabled|disabled}","what is the state of {fletchs|fletchers |} button"]
    	},function(req,res) {
    		//Check and inform user of status of IoT Button
    		savantLib.readState("userDefined.fletchButton" ,function(fletchButton) {
    			if (fletchButton==1){
    				log.error('queryFletchButton Intent: Fletchers Button is enabled');
    				res.say('Fletchers Button is enabled').send();
    			}else {
    				log.error('queryFletchButton Intent: Fletchers Button is currently disabled');
    				res.say('Fletchers Button is currently disabled').send();
    			};
    		});
    		return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
