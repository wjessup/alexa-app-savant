// import modules
const savantLib = require('../lib/savantLib');
const eventAnalytics = require('../lib/eventAnalytics');

// create and export function
module.exports = function disableFletcherButtonIntent(app, callback) {
  // define intent properties
  const intentDictionary = {
    name: 'disableFletcherButtonIntent',
    version: '3.0',
    description: 'Disable state of Amazon IoT button',
    enabled: true,
    required: {
      resolve: {},
      test: {}
    },
    voiceMessages: {
      success: 'Fletcher\'s button is now disabled.'
    },
    slots: {},
    utterances: ["disable {fletch|fletcher|fletcher's} button"],
    placeholder: {
      zone: {
        actionable: [],
        speakable: []
      }
    }
  };
  
  // check if intent is enabled
  if (intentDictionary.enabled) {
    // set up intent handler
    app.intent(intentDictionary.name, {
      slots: intentDictionary.slots,
      utterances: intentDictionary.utterances
    }, disableFletcherButtonIntentHandler);
  }
  
  // invoke callback with intentDictionary
  callback(intentDictionary);
  
  // Define intent handler function
  function disableFletcherButtonIntentHandler(req, res) {
    const event = new eventAnalytics.event(intentDictionary.name);
    
    // Disable button and send analytics
    return app.prep(req, res)
      .then(function(req) {
        savantLib.writeState('userDefined.fletchButton', 0);
        event.sendAlexa(['FletchButton', 'disable']);
        app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', intentDictionary.voiceMessages.success));
      })
      .catch(function(err) {
        app.intentErr(req, res, err);
      });
  }
};