// Import dependencies at the top of the module
const _ = require('lodash');
const format = require('simple-fmt');

// Define the intent dictionary as an object literal
const intentDictionary = {
  name: 'lowerVolumeAlot',
  version: '3.0',
  description: 'Lower volume for AV zone by a large preset ammount',
  enabled: true, // Use booleans instead of 1 or 0 to improve readability
  required: {
    resolve: ['zoneWithZone', 'zoneWithService'],
    test: {
      1: { scope: 'zone', attribute: 'actionable' },
      2: { scope: 'zone', attribute: 'speakable' },
    },
  },
  voiceMessages: {
    success: 'Lowering volume alot in {0}',
  },
  slots: { ZONE: 'ZONE', ZONE_TWO: 'ZONE_TWO' },
  utterances: [
    '{decreasePrompt} volume in {-|ZONE} a lot',
    'Make {-|ZONE} much lower',
    '{-|ZONE} is too loud',
    '{decreasePrompt} volume in {-|ZONE} and {-|ZONE_TWO} a lot',
    'Make {-|ZONE} and {-|ZONE_TWO} much lower',
    '{-|ZONE} and {-|ZONE_TWO} {is|are} too loud',
  ],
};

// Export the function as a module
module.exports = (app, callback) => {
  // Only execute the intent if it is enabled
  if (intentDictionary.enabled) {
    app.intent(
      intentDictionary.name,
      { slots: intentDictionary.slots, utterances: intentDictionary.utterances },
      (req, res) => {
        // Log event analytics
        const event = new app.lib.eventAnalytics.event(intentDictionary.name);

        // Extract the zone from the session attributes
        const zone = _.get(req.sessionAttributes, 'zone', {});

        // Increase the volume of the zone by 20 db
        app.lib.actionLib.relativeVolume(zone.actionable, -20, 20);

        // Respond with a success message and end the session
        app.intentSuccess(
          req,
          res,
          app.builderSuccess(
            intentDictionary.name,
            'endSession',
            format(intentDictionary.voiceMessages.success, zone.speakable),
          ),
        );
      },
    );
  }
  // Invoke the callback function
  callback(intentDictionary);
};