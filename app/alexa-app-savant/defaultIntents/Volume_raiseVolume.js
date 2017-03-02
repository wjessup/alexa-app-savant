const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'raiseVolume',
    'version' : '3.0',
    'description' : 'Increase volume for AV zone by a preset ammount',
    'enabled' : 1,
    'required' : {
      'resolve': ['zoneWithZone','zoneWithService'],
      'test': {
        '1' : {'scope': 'zone', 'attribute': 'actionable'},
        '2' : {'scope': 'zone', 'attribute': 'speakable'}
      }
    },
    'voiceMessages' : {
      'success': 'Increasing volume in {0}'
    },
    'slots' : {'ZONE':'ZONE','ZONE_TWO':'ZONE_TWO'},
    'utterances' : [
      '{increasePrompt} volume in {-|ZONE}', 'Make {-|ZONE} louder',
      '{increasePrompt} volume in {-|ZONE} and {-|ZONE_TWO}', 'Make {-|ZONE} and {-|ZONE_TWO} louder'
    ]
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function (){
          if (_.get(req.sessionAttributes,'error',{}) === 0){
            var zone = _.get(req.sessionAttributes,'zone',{});
          }else {
            log.error(intentDictionary.name+' - intent not run verify failed')
            return
          }
          action.relativeVolume(zone.actionable,6,10);
          return zone
        })
        .then(function (zone){
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',format(intentDictionary.voiceMessages.success,zone.speakable)))
        })
        .fail(function(err) {
          app.intentErr(req,res,err);
        });
    }
    );
  }
  callback(intentDictionary);
};
