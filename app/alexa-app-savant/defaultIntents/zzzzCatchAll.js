const _ = require('lodash');
const actionLib = require('../lib/actionLib');
const eventAnalytics = require('../lib/eventAnalytics');

module.exports = (app, callback) => {
  const catchAllIntent = {
    name: 'zzzzCatchAll',
    version: '3.0',
    description: 'Catch rogue requests',
    enabled: 1,
    required: {
      resolve: {},
      test: {},
    },
    voiceMessages: {
      success: '',
    },
    slots: {
      zone: 'ZONE',
      zoneTwo: 'ZONE_TWO',
      service: 'SERVICE',
      commandReq: 'COMMANDREQ',
    },
    utterances: [
      '{-|ZONE}',
      '{-|ZONE_TWO}',
      '{-|SERVICE}',
      '{-|COMMANDREQ}',
    ],
  };

  if (catchAllIntent.enabled === 1) {
    app.intent(catchAllIntent.name, {
      slots: catchAllIntent.slots,
      utterances: catchAllIntent.utterances,
    }, (req, res) => {
      const event = new eventAnalytics.event(catchAllIntent.name);
      return app.prep(req, res)
        .then((req) => {
          event.sendAlexa(['zzzzCatchAllIntnet', '']);
        })
        .catch((err) => {
          app.intentErr(req, res, err);
        });
    });
  }
  callback(catchAllIntent);
};