const action = require('../lib/actionLib');
const _ = require('lodash');
const eventAnalytics = require('../lib/eventAnalytics');

// Define the intent dictionary
const intentDictionary = {
  name: 'StartService',
  version: '3.0',
  description: 'Turn on any service in any AV zone',
  enabled: true,
  required: {
    resolve: ['zoneWithZone', 'serviceWithService'],
    test: {
      1: { scope: 'zone', attribute: 'actionable' },
      2: { scope: 'zone', attribute: 'speakable' },
      3: { scope: 'service', attribute: 'serviceArray' },
    },
  },
  voiceMessages: {
    success: 'Turning on {0} in {1}',
  },
  slots: { ZONE: 'ZONE', ZONE_TWO: 'ZONE_TWO', SERVICE: 'SERVICE' },
  utterances: [
    '{enablePrompt} {-|SERVICE} in {the |} {-|ZONE}',
    '{enablePrompt} {-|SERVICE} in {the |} {-|ZONE} and {-|ZONE_TWO}',
    '{enablePrompt} {-|ZONE} to {-|SERVICE}',
    '{enablePrompt} {-|ZONE} and {-|ZONE_TWO} to {-|SERVICE}',
  ],
};

// Export the function to the modules
module.exports = function (app, callback) {
  // Check if the intent is enabled
  if (intentDictionary.enabled) {
    // Register the intent with the app
    app.intent(
      intentDictionary.name,
      { slots: intentDictionary.slots, utterances: intentDictionary.utterances },
      function (req, res) {
        // Create an instance of the event analytics event
        const a = new eventAnalytics.event(intentDictionary.name);

        // Send power command to all found service arrays
        return app
          .prep(req, res)
          .then(function (req) {
            // Check if there isn't any error
            if (_.get(req.sessionAttributes, 'error', {}) === 0) {
              const zone = _.get(req.sessionAttributes, 'zone', {});
              const service = _.get(req.sessionAttributes, 'service', { name: 'Zone' });
              const command = _.get(req.sessionAttributes, 'command', {});
            } else {
              log.error(intentDictionary.name + ' - intent not run verify failed');
              return;
            }
            a.sendAV([zone, req.slot('service.name'), 'PowerOn']);
            // Turn on the service
            return action.bulkPowerOn(service.serviceArray).thenResolve(`Turning on ${service.name} in ${zone.speakable}`);
          })
          .then(function (voiceMessage) {
            // Inform
            log.error(intentDictionary.name + ` Intent: ${voiceMessage} Note: ()`);
            res.say(voiceMessage);
          })
          .fail(function (err) {
            app.intentErr(req, res, err);
          });
      }
    );
  }

  callback(intentDictionary);
};