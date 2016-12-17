//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'queryHVACMode',
    'intentVersion' : '1.0',
    'intentDescription' : 'Get current mode for single HVAC zone. NOTE: change tstatScope in config file',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('queryHVACMode', {
    		"slots":{}
    		,"utterances":["what mode is the {hvacSystemPrompt} in","is the {hvacSystemPrompt} on","is the {hvacSystemPrompt} off"]
    	},function(req,res) {
    		//query HVAc mode state
    		savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatMode_'+tstatScope[5], function(currentMode) {
          var voiceMessage = 'The system is currently set to '+ currentMode;
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
    		});
    		return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
