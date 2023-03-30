// Import required modules
const savantLib = require('../lib/savantLib');

// Export the intent function
module.exports = function turnOnSantaIntent(app, callback){

  // Intent metadata
  const intentInfo = {
    name : 'turnOnSanta',
    version : '1.0',
    description : 'Launch custom workflow making santa fart',
    enabled : false
  };

  // Enable/Disable Intent
  if (intentInfo.enabled){

    // Handle 'turnOnSanta' intent
    app.intent('turnOnSanta', {
      slots: {
        ZONE: 'ZONE'
      },
      utterances: [
        "Turn on santa",
        "make santa talk"
      ]
    }, (req, res) => {
        savantLib.serviceRequest(["Santa"], "custom");
        console.log('turnOnSanta Intent: Santa');
        res.say("").send();
    });
  }

  // Return intent metadata
 callback(intentInfo);
};