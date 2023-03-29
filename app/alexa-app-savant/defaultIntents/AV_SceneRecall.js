const action = require('../lib/actionLib');
const _ = require('lodash');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'serviceControl',
  version: '3.0',
  description: 'Send AV command to requested zone',
  enabled: 1,
  required: {
    resolve: ['zoneWithZone', 'zoneWithService', 'commandWithCommand'],
    test: {
      '1': { scope: 'zone', attribute: 'actionable' },
      '2': { scope: 'zone', attribute: 'speakable' },
      '3': { scope: 'command', attribute: 'avCommand' },
    },
    failMessage: [], // ['zoneService'],
  },
  voiceMessages: { success: {} },
  slots: {
    ZONE: 'ZONE',
    ZONE_TWO: 'ZONE_TWO',
    SERVICE: 'SERVICE',
    COMMANDREQ: 'COMMANDREQ',
  },
  utterances: [
    '{to |} control {-|SERVICE}',
    "{to |} control {-|ZONE}",
    "{-|COMMANDREQ}",
    "{to |} {-|COMMANDREQ} in {-|ZONE}",
    "{to |} {-|COMMANDREQ} {-|ZONE}",
    "{to |} {send |} {-|COMMANDREQ} {command |}",
    "{to |} {send |} {-|COMMANDREQ} in {-|ZONE}",
    "{to |} {send |} {-|COMMANDREQ} {command |} {to |} {-|SERVICE} ",
    "{to |} {send |} {-|COMMANDREQ} {command |}{in |} {the |} {-|ZONE}",
    "{to |} {send |} {-|COMMANDREQ} {command |}{in |} {the |} {-|ZONE} and {-|ZONE_TWO}",
    "{-|ZONE} and {-|ZONE_TWO} {to |} {-|COMMANDREQ}",
    "{to |} {-|COMMANDREQ} {-|SERVICE}",
    "{-|ZONE} {to |} {-|COMMANDREQ}",
  ],
};

function serviceControl(app, callback) {
  if (intentDictionary.enabled === 1) {
    app.intent(intentDictionary.name, { slots: intentDictionary.slots, utterances: intentDictionary.utterances }, (req, res) => {
      const analyticsEvent = new eventAnalytics.event(intentDictionary.name);
      
      app.prep(req, res)
        .then(req => {
          if (_.get(req.sessionAttributes, 'error', {}) === 0) {
            const zone = _.get(req.sessionAttributes, 'zone', {});
            const service = _.get(req.sessionAttributes, 'service', { name: 'Zone' });
            const command = _.get(req.sessionAttributes, 'command', {});

            action.serviceCommand(zone.actionable, command.avCommand); // Send command to actionable zones
            
            const voiceMessage = app.isReprompt(req) ? 'ok' : req.slot('COMMANDREQ');
            
            req.data.request.intent.slots.COMMANDREQ.value = ''; // clear COMMANDREQ slot so we don't get duplicate last command
            req.sessionAttributes.command = {};
            
            app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'reprompt', voiceMessage));
            
            analyticsEvent.sendAV([zone, service.name, command.avCommand]);
          } else {
            log.error(intentDictionary.name + ' - intent not run verify failed');
            return;
          }
        })
        .catch(err => {
          log.error("err " + err);
          app.intentErr(req, res, err);
        });
    });
  }
  
  callback(intentDictionary);
}

module.exports = serviceControl;