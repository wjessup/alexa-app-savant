// Import dependencies
const savantLib = require('../lib/savantLib');

// Set up intent
const powerOffFirstFloorIntent = {
    name: 'powerOff_FirstFloor',
    version: '1.0',
    description: 'Power off multiple known zones on the first floor',
    enabled: false
};

// Check if intent is enabled
if (powerOffFirstFloorIntent.enabled) {
  // Set up utterances and function for intent
  const utterances = ["{actionPrompt} off first floor"];
  const intentFunction = function(req, res) {
    console.log('Power Off Intent: Turning off first floor');
    savantLib.serviceRequest(["Kitchen","PowerOff"],"zone");
    savantLib.serviceRequest(["Family Room","PowerOff"],"zone");
    savantLib.serviceRequest(["Living Room","PowerOff"],"zone");
    savantLib.serviceRequest(["Dining Room","PowerOff"],"zone");
    res.say('Turning off first floor').send();
    return false;
  };
  
  // Export intent
  module.change_code = 1;
  module.exports = function(app, callback) {
    app.intent('powerOff_FirstFloor', {
      slots: { ZONE: 'ZONE' },
      utterances: utterances
    }, intentFunction);
    callback(powerOffFirstFloorIntent);
  };
}