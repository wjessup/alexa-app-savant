//Intent includes
var savantLib = require('../lib/savantLib'),
eventAnalytics = require('../lib/eventAnalytics');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'queryCoolSetPoint',
    'intentVersion' : '1.0',
    'intentDescription' : 'Get current cool point temperature for single HVAC zone. NOTE: change tstatScope in config file',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('queryCoolSetPoint', {
        "slots":{"currentTemp":"NUMBER"}
        ,"utterances":["what is the current Cool set point"]
      },function(req,res) {
        //query cool point state
        savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentCoolPoint_'+tstatScope[5], function(currentTemp) {
          eventAnalytics.send(intentDictionary.intentName,undefined,"HVAC","ThermostatCurrentCoolPoint_",undefined,undefined,undefined,undefined,currentTemp);
          var voiceMessage = 'The AC is currently set to '+ currentTemp +' degrees';
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
