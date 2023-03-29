const savantLib = require('../lib/savantLib'),
    _ = require('lodash'),
    format = require('simple-fmt'),
    eventAnalytics = require('../lib/eventAnalytics');

module.exports = function (app, callback) {

  const intentDictionary = createIntentDictionary();

  if (intentDictionary.enabled === 1) {
    app.intent(intentDictionary.name, { 'slots': intentDictionary.slots, 'utterances': intentDictionary.utterances },
      function (req, res) {
        const event = new eventAnalytics.event(intentDictionary.name);
        return app.prep(req, res)
          .then(() => savantLib.readStateQ(`${tstatScope[1]}.${tstatScope[2]}.ThermostatMode_${tstatScope[5]}`))
          .then(currentMode => {
            event.sendHVAC(["ThermostatMode_", currentMode]);
            checkRequestedModeMatchesCurrent(req, currentMode);
            return processRequestedMode(req, currentMode);
          })
          .then(mode => app.respondWithVoiceMessage(req, res, mode))
          .fail(err => app.intentErr(req, res, err));
      }
    );
  }

  callback(intentDictionary);

  function createIntentDictionary() {
    return {
      'name': 'setHVACMode',
      'version': '3.0',
      'description': 'Set current mode for single HVAC zone. NOTE: change tstatScope in config file',
      'enabled': 1,
      'required': {
        'resolve': [],
        'test': {},
        'failMessage': [] // ['zoneService']
      },
      'voiceMessages': {
        'success': 'Setting system mode to {0}',
        'error': {
          'outOfRange': 'I didnt understand please try again. Say a number between 60 and 90',
          'requestMatchCurrent': 'The system is already in {0} mode',
          'modeNoMatch': 'I didnt understand, please try again. Say Heat, Cool, Off, Auto, On, or Off'
        }
      },
      'slots': { "modeToSet": "LITERAL" },
      'utterances': ["{actionPrompt} {hvacSystemPrompt} to {hvacModes|modeToSet}"]
    };
  }

  function checkRequestedModeMatchesCurrent(req, currentMode) {
    if ((currentMode).toLowerCase() === (req.slot('modeToSet').toLowerCase())) {
      throw app.builderErr(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.error.requestMatchCurrent, currentMode), 'requestMatchCurrent');
    }
  }

  function processRequestedMode(req, currentMode) {
    switch (req.slot('modeToSet').toLowerCase()) { // Match request with servicerequest
      case "heat":
      case "cool":
      case "off":
      case "auto":
        return handleNormalMode(req);
      case "on":
        return handleOnMode(req, currentMode);
      default:
        throw app.builderErr(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.error.modeNoMatch), 'modeNoMatch');
        break;
    }
  }

  function handleNormalMode(req) {
    const modeAction = `SetHVACMode${_.capitalize(req.slot('modeToSet'))}`;
    savantLib.serviceRequest([...tstatScope.slice(0, 5), modeAction, "ThermostatAddress", tstatScope[5]], "full");
    event.sendHVAC([modeAction, req.slot('modeToSet')]);
    return format(intentDictionary.voiceMessages.success, req.slot('modeToSet'));
  }

  function handleOnMode(req, currentTemperature) {
    event.sendHVAC(["SetHVACModeOn", req.slot('modeToSet')]);
    return savantLib.readStateQ(`${tstatScope[1]}.${tstatScope[2]}.ThermostatCurrentTemperature_${tstatScope[5]}`)
      .then(currentTemperature => {
        const mode = (currentTemperature > 68) ? "Cool" : "Heat";
        savantLib.serviceRequest([...tstatScope.slice(0, 5), `SetHVACMode${mode}`, "ThermostatAddress", tstatScope[5]], "full");
        event.sendHVAC([`SetHVACMode${mode}`, req.slot('modeToSet')]);
        return format(intentDictionary.voiceMessages.success, req.slot('modeToSet'));
      });
  }
};