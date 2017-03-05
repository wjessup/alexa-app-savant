const
  savantLib = require('../lib/savantLib'),
  currentZoneLib = require('../lib/currentZoneLib'),
  _ = require('lodash'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'primaryZoneClear',
    'version' : '3.0',
    'description' : 'tell alexa what zone you are in',
    'enabled' : 1,
    'required' : {
      'resolve': {},
      'test':{}
    },
    'voiceMessages' : {
      'success': 'Clearing current zone'
    },
    'slots' : {},
    'utterances' : ['{clear|remove} {primary|current} zone']
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {
          currentZonePrevious = currentZone;
          currentZoneLib.set(false,'speakable');
          currentZoneLib.set(false,'actionable');
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',intentDictionary.voiceMessages.success))
          a.sendAlexa(['primaryZoneClear',currentZonePrevious]);
        })
        .fail(function(err) {
          app.intentErr(req,res,err);
        });
    }
    );
  }
  callback(intentDictionary);
};
