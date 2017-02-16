//Intent includes
var savantLib = require('../lib/savantLib'),
eventAnalytics = require('../lib/eventAnalytics');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'setHVACMode',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set current mode for single HVAC zone. NOTE: change tstatScope in config file',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('setHVACMode', {
        "slots":{"modeToSet":"LITERAL"}
        ,"utterances":["{actionPrompt} {hvacSystemPrompt} to {hvacModes|modeToSet}"]
      },function(req,res) {
        var a = new eventAnalytics.event(intentDictionary.intentName);
        //query HVAC mode to compare. if it matches request fail
        savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatMode_'+tstatScope[5], function(currentMode) {
          //console.log("The Current mode is: "+(currentMode).toLowerCase());
          //console.log("The requested mode is: "+req.slot('modeToSet').toLowerCase());
          a.sendHVAC(["ThermostatMode_",currentMode]);
          if (((currentMode).toLowerCase()) === (req.slot('modeToSet').toLowerCase())) {
            var voiceMessage = 'The system is already in '+ currentMode +' Mode';
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
            a.sendError("setHVACMode Mode Already set: "+ req.slot('modeToSet'));
            return false;
          }

          //Match request with servicerequest
          switch (req.slot('modeToSet').toLowerCase()){
            case "heat":
              var voiceMessage = 'Setting system mode to '+ req.slot('modeToSet');
              savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
              savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeHeat","ThermostatAddress",tstatScope[5]],"full");
              a.sendHVAC(["SetHVACModeHeat",req.slot('modeToSet')]);
              break;
            case "cool":
              var voiceMessage = 'Setting system mode to '+ req.slot('modeToSet');
              savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
              savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeCool","ThermostatAddress",tstatScope[5]],"full");
              a.sendHVAC(["SetHVACModeCool",req.slot('modeToSet')]);
              break;
            case "off":
              var voiceMessage = 'Setting system mode to '+ req.slot('modeToSet');
              savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
              savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeOff","ThermostatAddress",tstatScope[5]],"full");
              a.sendHVAC(["SetHVACModeOff",req.slot('modeToSet')]);
              break;
            case "auto":
              var voiceMessage = 'Setting system mode to '+ req.slot('modeToSet');
              savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
              savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeAuto","ThermostatAddress",tstatScope[5]],"full");
              a.sendHVAC(["SetHVACModeAuto",req.slot('modeToSet')]);
              break;
            case "on":
              a.sendHVAC(["SetHVACModeOn",req.slot('modeToSet')]);
              //get current temperature state, decide what to do based on current temperature
              savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentTemperature_'+tstatScope[5], function(currentTemp) {
                //console.log("Back in Function with data:  " +currentTemp);
                if (currentTemp>68){
                  savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeCool","ThermostatAddress",tstatScope[5]],"full");
                  a.sendHVAC(["SetHVACModeCool",req.slot('modeToSet')]);
                }
                if (currentTemp<68){
                  savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeHeat","ThermostatAddress",tstatScope[5]],"full");
                  a.sendHVAC(["SetHVACModeHeat",req.slot('modeToSet')]);
                }
              });
              break;
            default:
              var voiceMessage = 'I didnt understand, please try again. Say Heat,Cool,Off,Auto,On, or Off';
              a.sendError("setHVACMode Mode Match Fail: "+ req.slot('modeToSet'));
              break;
          }

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
