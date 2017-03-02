const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  savantLib = require('../lib/savantLib'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'lightsOffAVZoneGlobal',
    'version' : '3.0',
    'description' : 'Turn off lights in a defined AV zone using Savants __RoomSetBrightness workflow',
    'enabled' : 1,
    'required' : {
      'resolve': [],
      'test':{},
      'failMessage': []
    },
    'voiceMessages' : {
      'success': 'Turning off lights in all zones',
      'error':{}
    },
    'slots' : {},
    'utterances' : ['{actionPrompt} off all lights','{actionPrompt} off lights in all zones'],
    'placeholder' : {
      'zone' : {
        'actionable' : [],
        'speakable' : []
      }
    }
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {
          _.forEach(appDictionaryArray, function(zone){
            savantLib.serviceRequest([zone],'lighting','',[0]);
          });
          a.sendLighting([intentDictionary.placeholder.zone,'Off','']);
        })
        .then(function (voiceMessage){
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',intentDictionary.voiceMessages.success))
        })
        .fail(function(err) {
          log.error(err)
          app.intentErr(req,res,err);
        });
    }
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
