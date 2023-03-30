const matcherZone = require('../lib/matchers/zone');
const savantLib = require('../lib/savantLib');

module.exports = function(app, callback) {
  const intentDictionary = {
    name: 'lightsOffAVZone',
    version: '1.0',
    description: 'Turn off lights in a defined AV zone using Savants __RoomSetBrightness workflow',
    enabled: true
  };

  if (intentDictionary.enabled) {
    app.intent('lightsOffAVZone', {
      slots: { ZONE: 'ZONE' },
      utterances: ['{actionPrompt} off {-|ZONE} lights', '{actionPrompt} off lights in {-|ZONE}']
    }, function(req, res) {
      const zone = req.slot('ZONE');
      matcherZone.single(zone, function(err, cleanZone) {
        if (err) {
          const voiceMessage = err;
          console.error(`${intentDictionary.name} Intent: ${voiceMessage} Note: (Invalid Zone Match)`);
          res.say(voiceMessage).send();
          return;
        }

        const voiceMessage = `Turning off ${cleanZone} lights`;
        savantLib.serviceRequest([cleanZone], 'lighting', '', [0]);
        console.log(`${intentDictionary.name} Intent: ${voiceMessage} Note: ()`);
        res.say(voiceMessage).send();
      });
    });
  }

  callback(intentDictionary);
};