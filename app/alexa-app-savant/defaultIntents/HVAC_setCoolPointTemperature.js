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
        ,"utterances":["{actionPrompt} {AC|A.C.|cooling} to {65-85|tempToSet} {degrees |}"]
      },function(req,res) {
        //get current heatpoint, check againts request and decide what to do
        savantLib.readState('Savant SSTW100.HVAC_controller.ThermostatCurrentCoolPoint_1', function(currentSetPoint) {
          //console.log("The Current Set point is: "+currentSetPoint);
          //console.log("The requested Set point is: "+req.slot('tempToSet'));
          if (currentSetPoint == req.slot('tempToSet') ){
            console.log('setCoolPointTemperature Intent: The AC is already '+ currentSetPoint);
            res.say('The AC is already '+ currentSetPoint).send();
          } else {
            console.log('setCoolPointTemperature Intent: Setting AC to'+ req.slot('tempToSet'));
            savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetCoolPointTemperature","ThermostatAddress",tstatScope[5],"CoolPointTemperature",req.slot('tempToSet')],"full");
            res.say('Setting AC to'+ req.slot('tempToSet')).send();
          }
        });
        return false;
      }
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
