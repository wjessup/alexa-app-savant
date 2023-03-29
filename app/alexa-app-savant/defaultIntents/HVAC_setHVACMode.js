const savantLib = require('../lib/savantLib'),
      _ = require('lodash'),
      format = require('simple-fmt'),
      eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app, callback) {

  const intentDictionary = {
    name: 'setHVACMode',
    version: '3.0',
    description: 'Set current mode for single HVAC zone. NOTE: change tstatScope in config file',
    enabled: 1,
    required: {
      resolve: [],
      test: {},
      failMessage: [] //['zoneService']
    },
    voiceMessages: {
      success: 'Setting system mode to {0}',
      error: {
        outOfRange: 'I didnt understand please try again. Say a number between 60 and 90',
        requestMatchCurrent: 'The system is already in {0} mode',
        modeNoMatch: 'I didnt understand, please try again. Say Heat, Cool, Off, Auto, On, or Off'
      }
    },
    slots: { "modeToSet": "LITERAL" },
    utterances: ["{actionPrompt} {hvacSystemPrompt} to {hvacModes|modeToSet}"]
  };

  if (intentDictionary.enabled === 1) {
    app.intent(intentDictionary.name, {
      'slots': intentDictionary.slots,
      'utterances': intentDictionary.utterances
    },
      function(req, res) {
        const event = new eventAnalytics.event(intentDictionary.name);

        async function handleIntent() {
          try {
            await app.prep(req, res);

            const currentMode = await savantLib.readStateQ(tstatScope[1] + '.' + tstatScope[2] + '.ThermostatMode_' + tstatScope[5]);
            event.sendHVAC(["ThermostatMode_", currentMode]);

            if (currentMode.toLowerCase() === req.slot('modeToSet').toLowerCase()) {
              throw app.builderErr(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.error.requestMatchCurrent, currentMode), 'requestMatchCurrent');
            }

            const modeToSetStr = req.slot('modeToSet').toLowerCase();
            const modesToServiceRequestMap = {
              heat: "SetHVACModeHeat",
              cool: "SetHVACModeCool",
              off: "SetHVACModeOff",
              auto: "SetHVACModeAuto"
            };

            if (modesToServiceRequestMap[modeToSetStr]) {
              const serviceRequest = modesToServiceRequestMap[modeToSetStr];
              savantLib.serviceRequest([tstatScope[0], tstatScope[1], tstatScope[2], tstatScope[3], tstatScope[4], serviceRequest, "ThermostatAddress", tstatScope[5]], "full");
              event.sendHVAC([serviceRequest, req.slot('modeToSet')]);
            } else if (modeToSetStr === 'on') {
              event.sendHVAC(["SetHVACModeOn", req.slot('modeToSet')]);
              const currentTemperature = await savantLib.readStateQ(tstatScope[1] + '.' + tstatScope[2] + '.ThermostatCurrentTemperature_' + tstatScope[5]);
              const serviceRequest = (currentTemperature > 68) ? "SetHVACModeCool" : "SetHVACModeHeat";
              savantLib.serviceRequest([tstatScope[0], tstatScope[1], tstatScope[2], tstatScope[3], tstatScope[4], serviceRequest, "ThermostatAddress", tstatScope[5]], "full");
              event.sendHVAC([serviceRequest, req.slot('modeToSet')]);
            } else {
              throw app.builderErr(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.error.modeNoMatch), 'modeNoMatch');
            }

            const voiceMessage = format(intentDictionary.voiceMessages.success, req.slot('modeToSet'));
            app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage));

          } catch (err) {
            app.intentErr(req, res, err);
          }
        }

        handleIntent();
      });
  }

  callback(intentDictionary);
};