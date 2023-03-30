const _ = require('lodash');
const action = require('../lib/actionLib');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'pauseZone',
  version: '3.0',
  description: 'Send pause to requested zone',
  enabled: false,
  required: {
    resolve: ['zoneWithZone', 'zoneWithService'],
    test: {
      '1': { scope: 'zone', attribute: 'actionable' },
      '2': { scope: 'zone', attribute: 'speakable' },
    },
    failMessage: ['zoneService'],
  },
};

module.exports = function (app, callback) {
  if (!intentDictionary.enabled) {
    return;
  }
  app.intent(
    'pauseZone',
    {
      slots: { ZONE: 'ZONE', ZONE_TWO: 'ZONE_TWO', SERVICE: 'SERVICE' },
      utterances: [
        '{to|send} pause {command|}',
        '{to|send} pause in {-|ZONE}',
        '{to|send} pause {command|} {to|in} {-|SERVICE}',
        '{to|send} pause {command|}{in|} {the|} {-|ZONE}',
        '{to|send} pause {command|}{in|} {the|} {-|ZONE} and {-|ZONE_TWO}',
        '{-|ZONE} and {-|ZONE_TWO} {to|} pause',
        '{to|} pause {-|SERVICE}',
        '{-|ZONE} {to|} pause',
        '{tell|} {-|SERVICE} {to|} pause',
      ],
    },
    (req, res) => {
      const a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res).then((req) => {
        if (_.has(req, 'sessionAttributes')) {
          const zone = req.sessionAttributes.zone;
          const service = _.get(req.sessionAttributes, 'service', 'zone');
          action.serviceCommand(zone.actionable, 'Pause');
          const voiceMessage = 'Pause';
          console.error(intentDictionary.name + ' Intent: ' + voiceMessage + ' Note: ()');
          res.say(voiceMessage);
          a.sendAV([zone, service.name, 'Pause']);
        } else {
          return null;
        }
      }).catch((voiceMessage) => {
        console.error(intentDictionary.name + ' Intent: ' + voiceMessage + ' Note: ()');
        res.say(voiceMessage);
      });
    },
  );
  callback(intentDictionary);
};
