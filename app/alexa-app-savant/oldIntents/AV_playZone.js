// Import required libraries
const matcherZone = require('../lib/matchers/zone');
const savantLib = require('../lib/savantLib');

/**
 * Intent definition
 * 
 * This function defines a new Alexa intent for turning on lights in a Savant AV zone.
 * 
 * @param {Object} app - the Alexa app instance
 * @param {Function} callback - callback to return intent meta information to index
 */
module.change_code = 1;
module.exports = function(app, callback) {
  // Intent meta information
  const intentDictionary = {
    name: 'lightsOnAVZone',
    version: '1.0',
    description:
      'Turn on lights in a defined AV zone using Savants __RoomSetBrightness workflow',
    enabled: true, // Rename '1' to 'true'
  };

  // Enable/Disable intent
  if (intentDictionary.enabled) {
    const slots = { ZONE: 'ZONE' };
    const utterances = [
      '{turn|switch} on {-|ZONE} lights',
      '{turn|switch} on lights in {-|ZONE}',
    ];

    // Define the Alexa intent
    app.intent('lightsOnAVZone', { slots, utterances }, async (req, res) => {
      try {
        // Get the requested zone and clean up its name
        const cleanZone = await matcherZone.single(req.slot('ZONE'));
        const voiceMessage = `Turning on ${cleanZone} lights`;

        // Send a request to the Savant API to turn on the lights in the requested zone
        await savantLib.serviceRequest([cleanZone], 'lighting', '', [100]);

        // Log and respond with the voice message
        console.log(`${intentDictionary.name} Intent: ${voiceMessage}`);
        res.say(voiceMessage).send();
      } catch (error) {
        // Log and respond with an error message
        const voiceMessage = error.message;
        console.log(
          `${intentDictionary.name} Intent: ${voiceMessage} Note: (${error})`
        );
        res.say(voiceMessage).send();
      }

      return false; // Prevent duplicate responses
    });
  }

  // Return intent meta info to index
  callback(intentDictionary);
};