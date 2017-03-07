const
  savantLib = require('../lib/savantLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'setHVACMode',
    'version' : '3.0',
    'description' : 'Set current mode for single HVAC zone. NOTE: change tstatScope in config file',
    'enabled' : 1,
    'required' : {
      'resolve': [],
      'test':{},
      'failMessage': []//['zoneService']
    },
    'voiceMessages' : {
      'success': 'Setting system mode to {0}',
      'error':{
        'outOfRange' : 'I didnt understand please try again. Say a number between 60 and 90',
        'requestMatchCurrent' : 'The system is already in {0} mode',
        'modeNoMatch' : 'I didnt understand, please try again. Say Heat,Cool,Off,Auto,On, or Off'
      }
    },
    'slots' : {"modeToSet":"LITERAL"},
    'utterances' : ["{actionPrompt} {hvacSystemPrompt} to {hvacModes|modeToSet}"]
  };


  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {
          return savantLib.readStateQ(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatMode_'+tstatScope[5])
        })
        .then(function(currentMode){
          a.sendHVAC(["ThermostatMode_",currentMode]);
          if (((currentMode).toLowerCase()) === (req.slot('modeToSet').toLowerCase())) {
            throw app.builderErr(intentDictionary.name,'endSession',format(intentDictionary.voiceMessages.error.requestMatchCurrent,currentMode),'requestMatchCurrent')
          }
          switch (req.slot('modeToSet').toLowerCase()){//Match request with servicerequest
            case "heat":
              //savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
              savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeHeat","ThermostatAddress",tstatScope[5]],"full");
              a.sendHVAC(["SetHVACModeHeat",req.slot('modeToSet')]);
              break;
            case "cool":
              //savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
              savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeCool","ThermostatAddress",tstatScope[5]],"full");
              a.sendHVAC(["SetHVACModeCool",req.slot('modeToSet')]);
              break;
            case "off":
              //savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
              savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeOff","ThermostatAddress",tstatScope[5]],"full");
              a.sendHVAC(["SetHVACModeOff",req.slot('modeToSet')]);
              break;
            case "auto":
              //savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
              savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeAuto","ThermostatAddress",tstatScope[5]],"full");
              a.sendHVAC(["SetHVACModeAuto",req.slot('modeToSet')]);
              break;
            case "on":
              a.sendHVAC(["SetHVACModeOn",req.slot('modeToSet')]);
              //get current temperature state, decide what to do based on current temperature
              savantLib.readStateQ(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentTemperature_'+tstatScope[5])
              .then(function (currentTemperature){
                if (currentTemperature>68){
                  savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeCool","ThermostatAddress",tstatScope[5]],"full");
                  a.sendHVAC(["SetHVACModeCool",req.slot('modeToSet')]);
                }
                if (currentTemperature<68){
                  savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeHeat","ThermostatAddress",tstatScope[5]],"full");
                  a.sendHVAC(["SetHVACModeHeat",req.slot('modeToSet')]);
                }
              })
              break;
            default:
              throw app.builderErr(intentDictionary.name,'endSession',format(intentDictionary.voiceMessages.error.modeNoMatch),'modeNoMatch')
              break;
          }
          return format(intentDictionary.voiceMessages.success,req.slot('modeToSet'))
        })
        .then(function(voiceMessage) {
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',voiceMessage))
        })
        .fail(function(err) {
          app.intentErr(req,res,err);
        });
    }
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
