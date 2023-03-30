/**
 * This module exports an intent that tells Alexa the user's location
 * @module primaryZoneDeclare
 */

const savantLib = require('../lib/savantLib');
const currentZoneLib = require('../lib/currentZoneLib');
const _ = require('lodash');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

/**
 * Represents an intent for setting the user's location
 * @constructor
 * @param {Object} app - The Alexa app object
 * @param {function} callback - The callback function
 */
module.exports = function(app, callback) {

  const intentDictionary = {
    name: 'primaryZoneDeclare',
    version: '3.0',
    description: 'tell alexa what zone you are in',
    enabled: true,
    required: {
      resolve: ['zoneWithZone'],
      test: {
        1: { scope: 'zone', attribute: 'actionable' },
        2: { scope: 'zone', attribute: 'speakable' }
      }
    },
    voiceMessages: {
      success: 'Setting location to {0}'
    },
    slots: {
      ZONE: 'ZONE'
    },
    utterances: [
      'I am in {the |} {-|ZONE}',
      "I'm in {the |} {-|ZONE}",
      'set {primry |} {location|zone} to {-|ZONE}'
    ]
  };

  if (intentDictionary.enabled) {
    app.intent(
      intentDictionary.name, 
      { slots: intentDictionary.slots, utterances: intentDictionary.utterances },
      function(req, res) {
        const a = new eventAnalytics.event(intentDictionary.name);
        return app.prep(req, res)
          .then(function(req) {
            const errorStatus = _.get(req.sessionAttributes, 'error', {});
            if (errorStatus === 0) {
              const zone = _.get(req.sessionAttributes, 'zone', {});
              currentZoneLib.set(zone.speakable, 'speakable');
              currentZoneLib.set(zone.actionable, 'actionable');
              app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', format(intentDictionary.voiceMessages.success, zone.speakable)));
              a.sendAlexa(['primaryZoneDeclare', currentZoneLib]);
            } else if (errorStatus === 1) {
              return;
            }
          })
          .catch(function(err) {
              app.intentErr(req, res, err);
          });
      }
    );
  }
  callback(intentDictionary);
};
