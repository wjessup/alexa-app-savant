const savantLib = require('../lib/savantLib');
const _ = require('lodash');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');


const sceneRecallIntentDictionary = {
  name: 'sceneRecall',
  version: '3.0',
  description: 'Recall a favorite channel',
  enabled: true,
  required: {
    resolve: ['sceneWithScene'],
    test: [
      {
        scope: 'scene',
        attribute: 'name'
      }
    ],
    failMessage: []   // ['zoneService'] - commented out unused value
  },
  voiceMessages: {
    success: "Activating {0}"
  },
  slots: {
    SCENE: "LITERAL"
  },
  utterances: [
    '{sceneAction} {scene |} {sceneExample|SCENE}',
    'I am {sceneExample|SCENE}',
    "I'm {sceneExample|SCENE}",
    'We are {sceneExample|SCENE}',
    "We're {sceneExample|SCENE}"
  ],
  placeholder: {
    zone: {
      actionable: [],
      speakable: []
    }
  },
  savantVersionRequired: '8.3'
};

module.exports = function(app, callback) {

  if (app.compareVersion(app.environment.version, sceneRecallIntentDictionary.savantVersionRequired) < 0) {
    sceneRecallIntentDictionary.enabled = false;
    log.error(`Current Savant version ${app.environment.version} does not meet the required minimum Savant version for ${sceneRecallIntentDictionary.name}`);
  }

  function handleIntent(req, res) {
    const analytics = new eventAnalytics.event(sceneRecallIntentDictionary.name);
    return app.prep(req, res)
      .then(function(req) {
        if (_.get(req.sessionAttributes, 'error', 0) === 0) {
          const scene = _.get(req.sessionAttributes, 'scene', {});
          analytics.sendAV([sceneRecallIntentDictionary.placeholder.zone, 'Scene', scene.name]);
          return savantLib.activateScene(scene);
        }
        log.error(`${sceneRecallIntentDictionary.name} - intent not run verify failed`);
      })
      .then(function(scene) {
        app.intentSuccess(req, res, app.builderSuccess(sceneRecallIntentDictionary.name, 'endSession', format(sceneRecallIntentDictionary.voiceMessages.success, scene.name)));
      })
      .catch(function(err) {
        log.error(`Error: ${err}`);
        app.intentErr(req, res, err);
      });
  }

  if (sceneRecallIntentDictionary.enabled) {
    app.intent(sceneRecallIntentDictionary.name, {
      slots: sceneRecallIntentDictionary.slots,
      utterances: sceneRecallIntentDictionary.utterances
    }, handleIntent);
  }
  callback(sceneRecallIntentDictionary);
};