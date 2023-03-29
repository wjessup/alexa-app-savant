const action = require('../lib/actionLib');
const _ = require('lodash');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'powerOn',
  version: '3.0',
  description: 'Power on requested zone with last used service',
  enabled: 1,
  required: {
    resolve: ['zoneWithZone', 'zoneWithService', 'rangeWithRange'],
    test: {
      '1': { scope: 'zone', attribute: 'actionable' },
      '2': { scope: 'zone', attribute: 'speakable' }
    },
    failMessage: []
  },
  voiceMessages: {
    success: {
      lighting: 'Turning on lights in {0}',
      lightingRange: 'Setting lights to {0} in {1}',
      lightingPercent: 'Setting lights to {0} percent in {1}',
      av: 'Turning on {0}'
    }
  },
  slots: {
    ZONE: 'ZONE',
    ZONE_TWO: 'ZONE_TWO',
    LIGHTING: 'LIGHTING',
    RANGE: 'RANGE',
    PERCENTAGE: 'PERCENTAGE'
  },
  utterances: [
    '{actionPrompt} on',
    '{actionPrompt} on {-|ZONE}',
    '{actionPrompt} {-|ZONE}',
    '{actionPrompt} {-|ZONE} and {-|ZONE_TWO}',
    '{actionPrompt} on {-|ZONE} {-|LIGHTING}',
    '{actionPrompt} on {-|ZONE} and {-|ZONE_TWO} {-|LIGHTING}',
    '{actionPrompt} {-|LIGHTING} on',
    '{actionPrompt} {-|LIGHTING} in {-|ZONE}',
    '{actionPrompt} {-|LIGHTING} in {-|ZONE} and {-|ZONE_TWO}',
    '{actionPrompt} {-|LIGHTING} to {-|RANGE}',
    '{actionPrompt} {-|LIGHTING} on {-|ZONE} to {-|RANGE}',
    '{actionPrompt} {-|LIGHTING} on {-|ZONE} and {-|ZONE_TWO} to {-|RANGE}',
    '{actionPrompt} on {-|ZONE} {-|LIGHTING} to {-|RANGE}',
    '{actionPrompt} on {-|ZONE} {-|LIGHTING} and {-|ZONE_TWO} to {-|RANGE}',
    '{actionPrompt} on {-|LIGHTING} to {-|RANGE} in {-|ZONE}',
    '{actionPrompt} on {-|LIGHTING} to {-|RANGE} in {-|ZONE} and {-|ZONE_TWO}',
    '{actionPrompt} {-|LIGHTING} to {-|PERCENTAGE} percent',
    '{actionPrompt} {-|LIGHTING} on {-|ZONE} to {-|PERCENTAGE} percent',
    '{actionPrompt} {-|LIGHTING} on {-|ZONE} and {-|ZONE_TWO} to {-|PERCENTAGE} percent',
    '{actionPrompt} {-|ZONE} {-|LIGHTING} to {-|PERCENTAGE} percent',
    '{actionPrompt} {-|ZONE} and {-|ZONE_TWO} {-|LIGHTING} to {-|PERCENTAGE} percent',
    '{actionPrompt} {-|LIGHTING} to {-|PERCENTAGE} percent {-|ZONE}',
    '{actionPrompt} {-|LIGHTING} to {-|PERCENTAGE} percent {-|ZONE} and {-|ZONE_TWO}'
  ]
};

function handleRequest(req, zone, params) {
  const eventName = intentDictionary.name;
  const a = new eventAnalytics.event(eventName);
  
  if (_.get(req.sessionAttributes, 'error', {}) !== 0) {
    log.error(`${eventName} - intent not run verify failed`);
    return;
  }
  
   // ... (The rest of functions previously defined within the if-else)
}

module.exports = function (app, callback) {
  if (intentDictionary.enabled === 1) {
    app.intent(intentDictionary.name, { slots: intentDictionary.slots, utterances: intentDictionary.utterances },
      function (req, res) {
        return app.prep(req, res)
          .then(function (req) {
            const zone = _.get(req.sessionAttributes, 'zone', {});
            const params = _.get(req.sessionAttributes, 'params', {});

            return handleRequest(req, zone, params);
          })
          .then(function (voiceMessage) {
            app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage));
          })
          .fail(function (err) {
            app.intentErr(req, res, err);
          });
      });
  }

  callback(intentDictionary);
};