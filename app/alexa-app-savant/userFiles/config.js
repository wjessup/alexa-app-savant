// Import required modules
const savantLib = require('../lib/savantLib');

// Define intent
module.exports = function(app, callback) {
  const intent = {
    name: 'queryFletchButton',
    version: '1.0',
    description: 'Query state of Amazon IoT Button',
    enabled: true
  };

  // Verify if intent is enabled
  if (intent.enabled) {
    // Handle 'queryFletchButton' intent
    app.intent(intent.name, {
      slots: {},
      utterances: ['is {fletchs|fletchers} button {enabled|disabled}', 'what is the state of {fletchs|fletchers} button']
    }, function(req, res) {
      savantLib.readState('userDefined.fletchButton', function(fletchButton) {
        if (fletchButton === 1) {
          console.log('queryFletchButton Intent: Fletchers Button is enabled');
          res.say('Fletchers Button is enabled').send();
        } else {
          console.log('queryFletchButton Intent: Fletchers Button is currently disabled');
          res.say('Fletchers Button is currently disabled').send();
        };
      });
      return false;
    });
  }

  // Return intent meta info to index
  callback(intent);
};