const action = require('../lib/actionLib');
const _ = require('lodash');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'channelRecall',
  version: '3.0',
  description: 'Recalls a favorite channel',
  enabled: true,
  required: {
    resolve: ['zoneWithZone', 'zoneWithService', 'channelWithName'],
    test: {
      1: { scope: 'zone', attribute: 'actionable' },
      2: { scope: 'zone', attribute: 'speakable' },
      3: { scope: 'channel', attribute: 'number' },
    },
    failMessage: [], // ['zoneService']
  },
  voiceMessages: {
    success: {},
  },
  slots: { ZONE: 'ZONE', ZONE_TWO: 'ZONE_TWO', SERVICE: 'SERVICE', CHANNEL: 'CHANNEL' },
  utterances: [
    '{channelAction} {to |} {-|CHANNEL}',
    '{channelAction} {to |} {-|CHANNEL} {in |} {-|ZONE}',
    '{channelAction} {to |} {-|CHANNEL} {in |} {-|ZONE} and {-|ZONE_TWO}',
    '{channelAction} {-|SERVICE} to {-|CHANNEL}',
    '{channelAction} {to |} {-|CHANNEL} on  {-|SERVICE}',
    '{-|CHANNEL}',
  ],
};

function asyncChannelTune(zone, channel) {
  const a = new eventAnalytics.event(intentDictionary.name);
  return action.channelTune(zone.actionable, channel).tap(function () {
    a.sendAV([zone, zone.service.name, 'Tune']);
  });
}

function channelRecall(app, callback) {
  if (!intentDictionary.enabled) {
    return;
  }

  app.intent(intentDictionary.name, { slots: intentDictionary.slots, utterances: intentDictionary.utterances }, (req, res) => {
    if (_.get(req.sessionAttributes, 'error', {}) === 0) {
      const zone = _.get(req.sessionAttributes, 'zone', {});
      const service = _.get(req.sessionAttributes, 'service', { name: 'Zone' });
      const channel = _.get(req.sessionAttributes, 'channel', {});
      return asyncChannelTune(zone, channel)
        .then((voiceMessage) => {
          req.data.request.intent.slots.CHANNEL.value = ''; // clear CHANNEL slot so we don't get duplicate last command
          req.sessionAttributes.channel = {};
          app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'reprompt', voiceMessage));
        })
        .catch((err) => {
          log.error(`Err: ${err}`);
          app.intentErr(req, res, err);
        });
    }
    log.error(`${intentDictionary.name} - intent not run verify failed`);
  });

  callback(intentDictionary);
}

module.exports = channelRecall;