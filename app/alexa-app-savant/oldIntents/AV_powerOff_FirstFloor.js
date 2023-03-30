const matcherZone = require('../lib/matchers/zone');
const savantLib = require('../lib/savantLib');

module.change_code = 1;

const intentDictionary = {
  name: 'lightsOnRange',
  version: '1.0',
  description: 'Set lighting for AV zone with high, medium and low presets',
  enabled: true,
};

module.exports = function (app, callback) {
  if (intentDictionary.enabled) {
    app.intent(intentDictionary.name,
      {
        slots: { RANGE: 'LITERAL', ZONE: 'ZONE' },
        utterances: ['{actionPrompt} on {-|ZONE} lights to {-|RANGE}']
      },
      function (request, response) {
        const range = request.slot('RANGE').toLowerCase();
        const zone = request.slot('ZONE').replace(/the/ig, '');

        if (!range) {
          const voiceMessage = 'I didn\'t understand. Please say high, medium or low.';
          response.say(voiceMessage).send();
          return false;
        }

        matcherZone.single(request.slot('ZONE'), function (error, cleanZone) {
          if (error) {
            const voiceMessage = error;
            response.say(voiceMessage).send();
            return;
          }

          switch (range) {
            case 'high':
              savantLib.serviceRequest([cleanZone], 'lighting', '', [100]);
              break;
            case 'medium':
              savantLib.serviceRequest([cleanZone], 'lighting', '', [50]);
              break;
            case 'low':
              savantLib.serviceRequest([cleanZone], 'lighting', '', [25]);
              break;
            default:
              const voiceMessage = 'I didn\'t understand. Please say high, medium or low.';
              response.say(voiceMessage).send();
              return false;
          }

          const voiceMessage = `Setting ${cleanZone} lights to ${range}.`;
          response.say(voiceMessage).send();
        });

        return false;
      }
    );
  }

  callback(intentDictionary);
};