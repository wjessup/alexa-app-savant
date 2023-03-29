const savantLib = require('../lib/savantLib');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'setHVACMode',
  version: '3.0',
  description: 'Set current mode for single HVAC zone. NOTE: change tstatScope in config file',
  enabled: 1,
  voiceMessages: {
    success: 'Setting system mode to {0}',
    error: {
      outOfRange: 'I didnt understand please try again. Say a number between 60 and 90',
      requestMatchCurrent: 'The system is already in {0} mode',
      modeNoMatch: 'I didnt understand, please try again. Say Heat,Cool,Off,Auto,On, or Off'
    }
  },
  slots: { "modeToSet": "LITERAL" },
  utterances: ["{actionPrompt} {hvacSystemPrompt} to {hvacModes|modeToSet}"]
};

function handleModeChange({mode, tstatScope, request}){
  savantLib.serviceRequest([...tstatScope, mode, "ThermostatAddress", tstatScope[5]], "full");
  const event = new eventAnalytics.event(intentDictionary.name);
  event.sendHVAC([mode, request.slot('modeToSet')]);
  return format(intentDictionary.voiceMessages.success, request.slot('modeToSet'));
}

module.exports = function (app, callback) {
  if (intentDictionary.enabled === 1) {
    app.intent(intentDictionary.name, { 'slots': intentDictionary.slots, 'utterances': intentDictionary.utterances },
      function (req, res) {
        return app.prep(req, res)
          .then(() => savantLib.readStateQ(tstatScope[1] + '.' + tstatScope[2] + '.ThermostatMode_' + tstatScope[5]))
          .then((currentMode) => {
            const a = new eventAnalytics.event(intentDictionary.name);
            a.sendHVAC(["ThermostatMode_", currentMode]);

            if (currentMode.toLowerCase() === req.slot('modeToSet').toLowerCase()) {
              throw app.builderErr(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.error.requestMatchCurrent, currentMode), 'requestMatchCurrent');
            }

            const modeToSet = req.slot('modeToSet').toLowerCase();
            const modeActions = {
              "heat": () => handleModeChange({mode:"SetHVACModeHeat",tstatScope,request: req}),
              "cool": () => handleModeChange({mode:"SetHVACModeCool",tstatScope,request: req}),
              "off": () => handleModeChange({mode:"SetHVACModeOff",tstatScope,request: req}),
              "auto": () => handleModeChange({mode:"SetHVACModeAuto",tstatScope,request: req}),
              "on": () => {
                const event = new eventAnalytics.event(intentDictionary.name);
                event.sendHVAC(["SetHVACModeOn", req.slot('modeToSet')]);

                return savantLib.readStateQ(`${tstatScope[1]}.${tstatScope[2]}.ThermostatCurrentTemperature_${tstatScope[5]}`)
                  .then((currentTemperature) => {
                    const mode = currentTemperature > 68 ? "SetHVACModeCool" : "SetHVACModeHeat";
                    return handleModeChange({mode,tstatScope,request: req});
                  });
              },
              "default": () => {
                throw app.builderErr(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.error.modeNoMatch), 'modeNoMatch');
              },
            };

            return (modeActions[modeToSet] || modeActions.default)();
          })
          .then((voiceMessage) => app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage)))
          .catch((err) => app.intentErr(req, res, err));
      }
    );
  }
  callback(intentDictionary);
};