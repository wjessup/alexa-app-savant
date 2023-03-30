const actionLib = require('../lib/actionLib');
const _ = require('lodash');
const savantLib = require('../lib/savantLib');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
    name: 'AV_sleepQuery',
    version: '3.0',
    description: 'get SleepTimerRemainingTime from zone sleep timer',
    enabled: true,
    required: {
        resolve: ['zoneWithZone'],
        test: {
            1: { scope: 'zone', attribute: 'actionable' },
            2: { scope: 'zone', attribute: 'speakable' }
        },
        failMessage: []
    },
    voiceMessages: {
        success: '{0} timer has about {1} minutes left',
        error: {
            timerNotset: '{0} timer is not set'
        }
    },
    slots: {ZONE: 'ZONE'},
    utterances: [
        'how much time is left in {-|ZONE}',
        'how much longer in {-|ZONE}',
        'how much time is left on the sleep timer in {-|ZONE}'
    ]
};

module.exports = function(app, callback) {
    if (intentDictionary.enabled) {
        app.intent(intentDictionary.name, {
            slots: intentDictionary.slots,
            utterances: intentDictionary.utterances
        }, function(req, res) {
            const a = new eventAnalytics.event(intentDictionary.name);
            
            function failResponse() {
                console.error(`${intentDictionary.name} - intent not run verify failed`);
                return;
            }

             function throwError() {
                throw app.builderErr(
                    intentDictionary.name,
                    'endSession',
                    format(intentDictionary.voiceMessages.error.timerNotset, zone.actionable[0]),
                    'timerNotset'
                );
             }

            return app.prep(req, res)
              .then(function(req) {
                  const error = _.get(req.sessionAttributes, 'error', {});
                  const zone = _.get(req.sessionAttributes, 'zone', {});
                  if (error === 0 && zone) {
                      return savantLib.readStateQ(`${zone.actionable[0]}.SleepTimerRemainingTime`);
                  } 
                  return failResponse();
              })
              .then(function(stateValue) {
                  if (stateValue === '') {
                      throwError();
                      a.sendError(`AV_sleepQuery Timer not set in: ${zone.actionable[0]}`);
                  } else{
                      let minSec = stateValue.split(':');
                      let minLeft = minSec[0].replace(/^[0\.]+/, '');
                      if (minSec[1] > 30) {
                          minLeft = Number(minLeft) + 1;
                      }
                      a.sendSleep([zone, 'SleepTimerRemainingTime', minLeft]);
                      const voiceMessage = format(intentDictionary.voiceMessages.success, zone.speakable[0], minLeft);
                      app.intentSuccess(req, res, app.builderSuccess(intentDictionary.name, 'endSession', voiceMessage));
                  }
              })
              .fail(function(err) {
                  app.intentErr(req, res, err);
              });
        });
    }
    callback(intentDictionary);
};