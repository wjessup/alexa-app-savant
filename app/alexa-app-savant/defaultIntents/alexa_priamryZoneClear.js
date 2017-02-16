const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'primaryZoneClear',
    'intentVersion' : '1.0',
    'intentDescription' : 'tell alexa what zone you are in',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('primaryZoneClear', {
    		"slots":{}
    		,"utterances":["{clear|remove} {primary|current} zone"]
    	}, function(req,res) {
        var a = new eventAnalytics.event(intentDictionary.intentName);
        //clear curent zone var
        var previousCurrentZone = currentZone;
        currentZone = false;
        savantLib.writeState("userDefined.currentZone","false");
        //inform
        var voiceMessage = "Clearing current zone";
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
        a.sendAlexa(["primaryZoneClear",previousCurrentZone]);
    		return false;
    	}
    );
  }
  callback(intentDictionary);
};
