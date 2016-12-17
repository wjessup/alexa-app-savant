//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'queryHeatSetPoint',
    'intentVersion' : '1.0',
    'intentDescription' : 'Get current heat point temperature for single HVAC zone. NOTE: change tstatScope in config file',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('queryHeatSetPoint', {
    		"slots":{"currentTemp":"NUMBER"}
    		,"utterances":["what is the current Heat set point", "what is the heat set to"]
    	},function(req,res) {
    		//query heat point state
    		savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentHeatPoint_'+tstatScope[5], function(currentTemp) {
          var voiceMessage = 'The Heat is currently set to '+ currentTemp +' degrees';
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
