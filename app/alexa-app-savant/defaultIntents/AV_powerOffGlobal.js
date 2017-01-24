const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');


module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'powerOffGlobal',
    'intentVersion' : '1.0',
    'intentDescription' : 'Power off all zones',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('powerOffGlobal', {
    		"slots":{}
    		,"utterances":["{actionPrompt} everything off", "{actionPrompt} off all zones", "{actionPrompt} off everything"]
    	}, function(req,res) {
        //message to send
        var voiceMessage = 'Turning off all zones';
        //Turn off zone
  			savantLib.serviceRequest(["","PowerOff"],"zone");
        //inform
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
    		return false;
        eventAnalytics.send(intentDictionary.intentName,undefined,"Zone","PowerOff");
    	}
    );
  }
  callback(intentDictionary);
};
