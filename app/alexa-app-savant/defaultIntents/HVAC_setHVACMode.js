const savantLib = require('../lib/savantLib');
const _ = require('lodash');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

module.exports = function (app, callback) {
  const intentDictionary = {
    name: 'setHVACMode',
    version: '3.0',
    description: 'Set current mode for single HVAC zone. NOTE: change tstatScope in config file',
    enabled: true,
    required: {
      resolve: [],
      test: {},
      failMessage: [], //['zoneService']
    },
    voiceMessages: {
      success: 'Setting system mode to {0}',
      error: {
        outOfRange: 'I didnt understand please try again. Say a number between 60 and 90',
        requestMatchCurrent: 'The system is already in {0} mode',
        modeNoMatch: 'I didnt understand, please try again. Say Heat,Cool,Off,Auto,On, or Off',
      },
    },
    slots: { modeToSet: 'LITERAL' },
    utterances: ['{actionPrompt} {hvacSystemPrompt} to {hvacModes|modeToSet}'],
  };

  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name, { slots: intentDictionary.slots, utterances: intentDictionary.utterances }, async function(req, res) {
      const a = new eventAnalytics.event(intentDictionary.name);
      try {
        // get current mode
        const currentMode = await savantLib.readStateQ(`${tstatScope[1]}.${tstatScope[2]}.ThermostatMode_${tstatScope[5]}`);
        a.sendHVAC(['ThermostatMode_', currentMode]);
        // compare current mode with requested mode and set if different
        if (currentMode.toLowerCase() === req.slot('modeToSet').toLowerCase()) {
          throw app.builderErr(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.error.requestMatchCurrent, currentMode), 'requestMatchCurrent');
        }
        switch (req.slot('modeToSet').toLowerCase()) {
          case 'heat':
            await savantLib.serviceRequest(
              [tstatScope[0], tstatScope[1], tstatScope[2], tstatScope[3], tstatScope[4], 'SetHVACModeHeat', 'ThermostatAddress', tstatScope[5]],
              'full'
            );
            a.sendHVAC(['SetHVACModeHeat', req.slot('modeToSet')]);
            break;
          case 'cool':
            await savantLib.serviceRequest(
              [tstatScope[0], tstatScope[1], tstatScope[2], tstatScope[3], tstatScope[4], 'SetHVACModeCool', 'ThermostatAddress', tstatScope[5]],
              'full'
            );
            a.sendHVAC(['SetHVACModeCool', req.slot('modeToSet')]);
            break;
          case 'off':
            await savantLib.serviceRequest(
              [tstatScope[0], tstatScope[1], tstatScope[2], tstatScope[3], tstatScope[4], 'SetHVACModeOff', 'ThermostatAddress', tstatScope[5]],
              'full'
            );
            a.sendHVAC(['SetHVACModeOff', req.slot('modeToSet')]);
            break;
          case 'auto':
            await savantLib.serviceRequest(
              [tstatScope[0], tstatScope[1], tstatScope[2], tstatScope[3], tstatScope[4], 'SetHVACModeAuto', 'ThermostatAddress', tstatScope[5]],
              'full'
            );
            a.sendHVAC(['SetHVACModeAuto', req.slot('modeToSet')]);
            break;
          case 'on':
            a.sendHVAC(['SetHVACModeOn', req.slot('modeToSet')]);
            const currentTemperature = await savantLib.readStateQ(`${tstatScope[1]}.${tstatScope[2]}.ThermostatCurrentTemperature_${tstatScope[5]}`);
            if (currentTemperature > 68) {
              await savantLib.serviceRequest(
                [tstatScope[0], tstatScope[1], tstatScope[2], tstatScope[3], tstatScope[4], 'SetHVACModeCool', 'ThermostatAddress', tstatScope[5]],
                'full'
              );
              a.sendHVAC(['SetHVACModeCool', req.slot('modeToSet')]);
            } else if (currentTemperature < 68) {
              await savantLib.serviceRequest(
                [tstatScope[0], tstatScope[1], tstatScope[2], tstatScope[3], tstatScope[4], 'SetHVACModeHeat', 'ThermostatAddress', tstatScope[5]],
                'full'
              );
              a.sendHVAC(['SetHVACModeHeat', req.slot('modeToSet')]);
            }
            break;
          default:
            throw app.builderErr(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.error.modeNoMatch), 'modeNoMatch');
        }
        const voiceMessage = format(intentDictionary.voiceMessages.success, req.slot('modeToSet'));
        app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage));
      } catch (err) {
        app.intentErr(req, res, err);
      }
    });
  }
  // Return intent meta info to index
  callback(intentDictionary);
};