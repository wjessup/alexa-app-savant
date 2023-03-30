const savantLib = require('../lib/savantLib');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'enableFletchButton',
  version: '3.0',
  description: 'Enable state of Amazon IoT button',
  enabled: true,
  required: {
    resolve: {},
    test: {},
  },
  voiceMessages: {
    success: 'Fletcher\'s button is now enabled',
  },
  slots: {},
  utterances: ['enable {fletch|fletcher|fletcher\'s|} button'],
  placeholder: {
    zone: {
      actionable: [],
      speakable: [],
    },
  },
};

function handleEnableFletchButtonRequest(req, res, a) {
  savantLib.writeState('userDefined.fletchButton', 1);
  a.sendAlexa(['FletchButton', 'enable']);
  const response = app.builderSuccess(intentDictionary.name, 'endSession', intentDictionary.voiceMessages.success);
  app.intentSuccess(req, res, response);
}

function enableFletchButtonIntentHandler(req, res) {
  const a = new eventAnalytics.event(intentDictionary.name);

  app.prep(req, res)
    .then(() => handleEnableFletchButtonRequest(req, res, a))
    .catch((err) => app.intentErr(req, res, err));
}

function enableFletchButton(app, callback) {
  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name, {
      slots: intentDictionary.slots,
      utterances: intentDictionary.utterances,
    }, enableFletchButtonIntentHandler);
  }
  callback(intentDictionary);
}

module.exports = enableFletchButton;