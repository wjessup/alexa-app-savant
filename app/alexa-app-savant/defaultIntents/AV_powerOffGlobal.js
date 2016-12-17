//Intent includes
var matcher = require('../lib/zoneMatcher');
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
    app.intent('powerOffGlobal', {
    		"slots":{}
    		,"utterances":["{actionPrompt} everything off", "{actionPrompt} off all zones", "{actionPrompt} off everything"]
    	},function(req,res) {
        //message to send
        var voiceMessage = 'Turning off all zones';
        //Turn off zone
  			savantLib.serviceRequest(["","PowerOff"],"zone");
        //inform
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
    		return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
