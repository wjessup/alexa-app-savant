//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'queryCurrentTemperature',
    'intentVersion' : '1.0',
    'intentDescription' : 'Get current temperature for single HVAC zone. NOTE: change tstatScope in config file',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
  app.intent('queryCurrentTemperature', {
      "slots":{"currentTemp":"NUMBER"}
      ,"utterances":["what is the current temperature"]
    },function(req,res) {
      //Get Current Temp state
      savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentTemperature_'+tstatScope[5], function(currentTemp) {
        console.log('queryCurrentTemperature Intent: The current temperature is '+ currentTemp +' degrees');
        res.say("The current temperature is "+ currentTemp +" degrees").send();
      });
      return false;
    }
  );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
