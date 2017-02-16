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
        var a = new eventAnalytics.event(intentDictionary.intentName);
        var voiceMessage = 'Turning off all zones';//message to send
  			savantLib.serviceRequest(["","PowerOff"],"zone");//Turn off zone
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();//inform
        a.sendAV(["All","Zone","PowerOff"]);
        return false;
    	}
    );
  }
  callback(intentDictionary);
};
