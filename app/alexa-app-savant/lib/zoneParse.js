const savantLib = require('../lib/savantLib');

module.exports = function(app, callback) {
  const intentDictionary = {
    name: 'powerOn_FirstFloor',
    version: '1.0',
    description: 'Power on known zones with last used service',
    enabled: false,
  };

  if (intentDictionary.enabled) {
    app.intent('powerOn_FirstFloor', {
        slots: { ZONE: 'ZONE' },
        utterances: ['{actionPrompt} on First Floor'],
      },
      function(req, res) {

        function getService(state, callback) {
          const cleanStateArray = state.replace(/(\r\n|\n|\r)/gm, '').split('-');
          const [part1, part2, part3, part4, part5] = cleanStateArray;

          const requests = [
            [part1, part2, part3, part4, part5, 'PowerOn'],
            ['Kitchen', part2, part3, part4, part5, 'PowerOn'],
            [part1, part2, part3, part4, part5, 'Play'],
          ];

          requests.forEach(req =>
            savantLib.serviceRequest(req, 'full', (err) => {
              if (err) {
                log.error(`Power On Intent: Error calling serviceRequest: ${err.message}`);
                callback(err);
              }
            })
          );

          callback();
        }

        const cleanState = 'Family Room.LastActiveService';

        savantLib.readState(cleanState, function(err, lastActiveService) {
          if (err) {
            log.error(`Power On Intent: Error calling readState: ${err.message}`);
            res.say('Something went wrong. Please try again').send();
            return false;
          }

          if (lastActiveService) {
            //get last Service
            log.error(`LastActiveService: ${lastActiveService}`);
            getService(lastActiveService, (error) => {
              if (error) {
                res.say('Something went wrong. Please try again').send();
              } else {
                res.say(`Turning on ${cleanStateArray[1]} in Family Room and Kitchen`).send();
              }
            });
          } else {
            log.error('Power On Intent: No previous service. Please choose a service to turn on');
            res.say('No previous service. Please choose a service to turn on').send();
          }
        });
        return false;
      });
  }

  callback(intentDictionary);
};