const action = require('../lib/actionLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function (app, callback) {
  const intentData = {
    name: 'powerOn',
    version: '3.0',
    description: 'Power on requested zone with last used service',
    isEnabled: true,
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
      'ZONE': 'ZONE',
      'ZONE_TWO': 'ZONE_TWO',
      'LIGHTING': 'LIGHTING',
      'RANGE': 'RANGE',
      'PERCENTAGE': 'PERCENTAGE'
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
      '{actionPrompt} {-|LIGHTING} to {-|PERCENTAGE} percent {-|ZONE} and {-|ZONE_TWO} '
    ]
  };

  if (intentData.isEnabled) {
    app.intent(intentData.name, { slots: intentData.slots, utterances: intentData.utterances },
      function (req, res) {
        const eventData = new eventAnalytics.event(intentData.name);
        return app.prep(req, res)
          .then(function (req) {
            if (_.get(req.sessionAttributes, 'error', {}) === 0) {
              var zone = _.get(req.sessionAttributes, 'zone', {});
              var params = _.get(req.sessionAttributes, 'params', {});
            } else {
              log.error(intentData.name + ' - intent not run verify failed');
              return;
            }

            const lightingSlot = req.slot('LIGHTING');
            const rangeSlot = req.slot('RANGE');
            const percentageSlot = req.slot('PERCENTAGE');

            if (!lightingSlot && !params.range && !percentageSlot) {
              eventData.sendAV([zone, 'Zone', 'PowerOn']);
              log.error(intentData.name + ' Intent - not a lighting request turn on last used AV source');
              return action.lastPowerOn(zone.actionable)
                .thenResolve(format(intentData.voiceMessages.success['av'], zone.speakable));
            }

            if (lightingSlot && params.range) {
              eventData.sendLighting([zone, params.range, lightingSlot]);
              log.error(intentData.name + ' Intent - a lighting request with range, turn on lights with requested range');
              return action.setLighting(zone.actionable, params.range, 'range')
                .thenResolve(format(intentData.voiceMessages.success['lightingRange'], params.range, zone.speakable));
            }

            if (lightingSlot && percentageSlot && !params.range) {
              eventData.sendLighting([zone, percentageSlot, lightingSlot]);
              log.error(intentData.name + ' Intent - a lighting request with a percentage, turn on lights with requested percentage');
              return action.setLighting(zone.actionable, percentageSlot, 'percent')
                .thenResolve(format(intentData.voiceMessages.success['lightingPercent'], percentageSlot, zone.speakable));
            }

            if (lightingSlot && !percentageSlot && !params.range) {
              eventData.sendLighting([zone, 'On', lightingSlot]);
              log.error(intentData.name + ' Intent - a lighting request without a percentage or range, turn on light to preset value');
              return action.setLighting(zone.actionable, "on", 'range')
                .thenResolve(format(intentData.voiceMessages.success['lighting'], zone.speakable));
            }
          })
          .then(function (voiceMessage) {
            app.intentSuccess(req, res, app.builderSuccess(intentData.name, 'endSession', voiceMessage));
          })
          .fail(function (err) {
            app.intentErr(req, res, err);
          });
      }
    );
  }
  callback(intentData);
};