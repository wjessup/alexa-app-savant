const savantLib = require('../lib/savantLib');
const eventAnalytics = require("../lib/eventAnalytics");

const tstatScope = ['path', 'to', 'your', 'thermostat', 'control', 'device'];

const intentDictionary = {
  name : 'setHVACMode',
  version : '3.0',
  description : 'Set current mode for single HVAC zone. NOTE: change tstatScope in config file',
  enabled : true,
  required : {
    resolve : [],
    test : {},
    failMessage : [] //['zoneService']
  },
  voiceMessages : {
    success: 'Setting system mode to {0}',
    error : {
      outOfRange : 'I didnt understand please try again. Say a number between 60 and 90',
      requestMatchCurrent : 'The system is already in {0} mode',
      modeNoMatch : 'I didnt understand, please try again. Say Heat, Cool, Off, Auto, On, or Off'
    }
  },
  slots : { modeToSet : 'LITERAL' },
  utterances : [ '{actionPrompt} {hvacSystemPrompt} to {hvacModes|modeToSet}' ]
};

module.exports = function(app, callback) {
  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name, {
      slots: intentDictionary.slots,
      utterances: intentDictionary.utterances
    }, function(req, res) {
      const a = new eventAnalytics.event(intentDictionary.name);

      return app.prep(req, res)
        .then(function(req) {
          return savantLib.readStateQ(`${tstatScope[1]}.${tstatScope[2]}.ThermostatMode_${tstatScope[5]}`);
        })
        .then(function(currentMode) {
          a.sendHVAC(["ThermostatMode_", currentMode]);

          const requestedMode = req.slot('modeToSet').toLowerCase();

          if (currentMode.toLowerCase() === requestedMode) {
            throw app.builderErr(intentDictionary.name, 'endSession', 
               format(intentDictionary.voiceMessages.error.requestMatchCurrent, currentMode), 'requestMatchCurrent');
          }

          switch (requestedMode) {
            case 'heat': 
              modeChangeHelper('SetHVACModeHeat', 'heat', a);
              break;
            case 'cool': 
              modeChangeHelper('SetHVACModeCool', 'cool', a);
              break;
            case 'off':
              modeChangeHelper('SetHVACModeOff', 'off', a);
              break;
            case 'auto': 
              modeChangeHelper('SetHVACModeAuto', 'auto', a);
              break;
            case 'on': 
              a.sendHVAC(['SetHVACModeOn', requestedMode]);
              
              savantLib.readStateQ(`${tstatScope[1]}.${tstatScope[2]}.ThermostatCurrentTemperature_${tstatScope[5]}`)
                .then(function(currentTemperature) {
                  if (currentTemperature > 68) {
                    modeChangeHelper('SetHVACModeCool', 'cool', a);
                  } else if (currentTemperature < 68) {
                    modeChangeHelper('SetHVACModeHeat', 'heat', a);
                  }
                });
              break;
            default:
              throw app.builderErr(intentDictionary.name, 'endSession', 
                 intentDictionary.voiceMessages.error.modeNoMatch, 'modeNoMatch');
            } 
            return format(intentDictionary.voiceMessages.success, requestedMode);
        })
        .then(function(voiceMessage) {
          app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage));
        })
        .fail(function(err) {
          app.intentErr(req, res, err);
        });
    });
  }
  callback(intentDictionary);
};

function modeChangeHelper(mode, requestedMode, a) {
  savantLib.serviceRequest([tstatScope[0], tstatScope[1], tstatScope[2], tstatScope[3], 
    tstatScope[4], mode, 'ThermostatAddress', tstatScope[5]], 'full');
  a.sendHVAC([mode, requestedMode]);
  return;
}