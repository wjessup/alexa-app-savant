//Intent includes
var matcher = require('../lib/zoneMatcher');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'primaryZoneClear',
    'intentVersion' : '1.0',
    'intentDescription' : 'tell alexa what zone you are in',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('primaryZoneClear', {
    		"slots":{}
    		,"utterances":["{clear|remove} {primary |} zone"]
    	},function(req,res) {
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
  //Return intent meta info to index
  callback(intentDictionary);
};
