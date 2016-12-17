//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'setCoolPointTemperature',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set current cool point for single HVAC zone. NOTE: change tstatScope in config file',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('setCoolPointTemperature', {
        "slots":{"tempToSet":"NUMBER"}
        ,"utterances":["{actionPrompt} {AC|A.C.|cooling} to {60-90|tempToSet} {degrees |}"]
      },function(req,res) {
        //check requested temp
        if (req.slot('tempToSet')< 59 ||req.slot('tempToSet')>91){
          var voiceMessage = 'I didnt understand please try again. Say a number between 60 and 90';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
          return
        }

        //get current heatpoint, check againts request and decide what to do
        savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentCoolPoint_'+tstatScope[5], function(currentSetPoint) {
          //console.log("The Current Set point is: "+currentSetPoint);
          //console.log("The requested Set point is: "+req.slot('tempToSet'));
          if (currentSetPoint == req.slot('tempToSet') ){
            var voiceMessage = 'The AC is already set to'+ currentSetPoint;
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
            return
          }

          //adjust Thermostat
          savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
          savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetCoolPointTemperature","ThermostatAddress",tstatScope[5],"CoolPointTemperature",req.slot('tempToSet')],"full");

          //inform
          var voiceMessage = 'Setting AC to'+ req.slot('tempToSet');
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
