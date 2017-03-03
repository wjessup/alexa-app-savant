const
  savantLib = require('../lib/savantLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'sceneRecall',
    'version' : '3.0',
    'description' : 'recall a fav channel',
    'enabled' : 1,
    'required' : {
      'resolve': ['sceneWithScene'],
      'test':{
        '1' : {'scope': 'scene', 'attribute': 'name'}
      },
      'failMessage': []//['zoneService']
    },
    'voiceMessages' : {
      'success': "activating {0}"
    },
    'slots' : {'SCENE':"LITERAL"},
    'utterances' : [
      '{sceneAction} {scene |} {sceneExample|SCENE}',
      'I am {sceneExample|SCENE}',
      "I'm {sceneExample|SCENE}",
      'we are {sceneExample|SCENE}',
      "We're {sceneExample|SCENE}"
    ],
    'placeholder' : {
      'zone' : {
        'actionable' : [],
        'speakable' : []
      }
    },
    'savantVersionRequired' : '8.3'
  };

  if (app.compareVersion(app.environment.version,intentDictionary.savantVersionRequired) < 0){
    intentDictionary.enabled = 0
    log.error('Current savant version '+app.environment.version+' does not meet miminum required savant version for '+intentDictionary.name)
  }

  if (intentDictionary.enabled === 1 ){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {
          if (_.get(req.sessionAttributes,'error',{}) === 0){
            var scene = _.get(req.sessionAttributes, 'scene',{});
          }else {
            log.error(intentDictionary.name+' - intent not run verify failed')
            return
          }
          a.sendAV([intentDictionary.placeholder.zone,'Scene',scene.name]);
          return savantLib.activateScene(scene)
        })
        .then(function(scene){
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',format(intentDictionary.voiceMessages.success,scene.name)))
        })
        .fail(function(err) {
          log.error("err "+err)
          app.intentErr(req,res,err);
        });
    }
    );
  }
  callback(intentDictionary);
};
