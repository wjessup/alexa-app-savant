const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib');

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
    		,"utterances":["{clear|remove} {primary |} zone"]
    	}, function(req,res) {
        //clear curent zone var
        currentZone = false;
        savantLib.writeState("userDefined.currentZone","false");
        //inform
        var voiceMessage = "Clearing current zone";
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
    		return false;
    	}
    );
  }
  callback(intentDictionary);
};
