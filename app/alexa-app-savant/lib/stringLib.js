const _ = require('lodash');
const action = require('../lib/actionLib');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'playZone',
  version: '3.0',
  description: 'Send play to requested zone',
  enabled: false,
  required: {
    resolve: ['zoneWithZone', 'zoneWithService'],
    test: {
      1: { scope: 'zone', attribute: 'actionable' },
      2: { scope: 'zone', attribute: 'speakable' },
    },
    failMessage: ['zoneService'],
  },
};

function playZoneIntent(app, callback) {
  if (intentDictionary.enabled) {
    app.intent('playZone', {
      slots: { ZONE: 'ZONE', ZONE_TWO: 'ZONE_TWO', SERVICE: 'SERVICE' },
      utterances: [
        '{to |} {send |} play {command |}',
        '{to |} {send |} play in {-|ZONE}',
        '{to |} {send |} play {command |} {to |} {-|SERVICE} ',
        '{to |} {send |} play {command |}{in |} {the |} {-|ZONE}',
        '{to |} {send |} play {command |}{in |} {the |} {-|ZONE} and {-|ZONE_TWO}',
        '{-|ZONE} and {-|ZONE_TWO} {to |} play',
        '{to |} play {-|SERVICE}',
        '{-|ZONE} {to |} play',
        '{tell |} {-|SERVICE} {to |} play'
      ],
    }, handlePlayZoneIntent);

    function handlePlayZoneIntent(req, res) {
      const a = new eventAnalytics.event(intentDictionary.name);
      app.prep(req, res)
        .then(() => {
          if (_.has(req, 'sessionAttributes')) {
            const { zone } = req.sessionAttributes;
            const service = _.get(req.sessionAttributes, 'service', 'zone');
            action.serviceCommand(zone.actionable, 'Play');
            const voiceMessage = 'Play';
            console.log(`${intentDictionary.name} Intent: ${voiceMessage} Note: ()`);
            res.say(voiceMessage);
            a.sendAV([zone, service.name, 'Play']);
          }
        })
        .catch((voiceMessage) => {
          console.error(`${intentDictionary.name} Intent: ${voiceMessage} Note: ()`);
          res.say(voiceMessage);
        });
    }
  }
  callback(intentDictionary);
}

module.exports = playZoneIntent;