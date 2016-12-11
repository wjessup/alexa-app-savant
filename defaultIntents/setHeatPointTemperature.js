//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'setHeatPointTemperature',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set current heat point for single HVAC zone. NOTE: change tstatScope in config file',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('setHeatPointTemperature', {
        "slots":{"tempToSet":"NUMBER"}
        ,"utterances":["{actionPrompt} heat to {65-85|tempToSet} {degrees |}"]
      },function(req,res) {
        //get current heatpoint, check againts request and decide what to do
        savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentHeatPoint_'+tstatScope[5], function(currentSetPoint) {
          //console.log("The Current Set point is: "+currentSetPoint);
          //console.log("The requested Set point is: "+req.slot('tempToSet'));
          if (currentSetPoint == req.slot('tempToSet') ){
            console.log('setHeatPointTemperature Intent: The current set point is already '+ currentSetPoint);
            res.say('The heat is already '+ currentSetPoint).send();
          } else {
            console.log('setHeatPointTemperature Intent: Setting setpoint to'+ req.slot('tempToSet'));
            savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
            savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHeatPointTemperature","HeatPointTemperature",req.slot('tempToSet')],"full");
            res.say('Setting heat setpoint to'+ req.slot('tempToSet')).send();
          }
        });
        return false;
      }
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
