//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'powerOffGlobal',
    'intentVersion' : '1.0',
    'intentDescription' : 'Power off all zones',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('powerOff', {
    		"slots":{}
    		,"utterances":["{actionPrompt} everything off", "{actionPrompt} off all zones", "{actionPrompt} off everything"]
    	},function(req,res) {
        //Turn off zone
  			savantLib.serviceRequest(["","PowerOff"],"zone");

        var voiceMessage = 'Turning off all zones';
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
    		return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
