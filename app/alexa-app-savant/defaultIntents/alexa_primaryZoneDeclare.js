const
  savantLib = require('../lib/savantLib'),
  currentZoneLib = require('../lib/currentZoneLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'primaryZoneDeclare',
    'version' : '3.0',
    'description' : 'tell alexa what zone you are in',
    'enabled' : 1,
    'required' : {
      'resolve': ['zoneWithZone'],
      'test':{
        '1' : {'scope': 'zone', 'attribute': 'actionable'},
        '2' : {'scope': 'zone', 'attribute': 'speakable'}
        }
    },
    'voiceMessages' : {
      'success': 'Setting location to {0}'
    },
    'slots' : {'ZONE':'ZONE'},
    'utterances' : ['I am in {the |} {-|ZONE}',"I'm in {the |} {-|ZONE}",'set {primry |} {location|zone} to {-|ZONE}']
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {
          if (_.get(req.sessionAttributes,'error',{}) === 0){
            var zone = _.get(req.sessionAttributes,'zone',{});
          }else {
            return
          }
          log.error('current type: '+currentZone.constructor)
          log.error('current type: '+JSON.stringify(currentZone))
          currentZoneLib.set(zone.speakable,'speakable');
          currentZoneLib.set(zone.actionable,'actionable');
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',format(intentDictionary.voiceMessages.success,zone.speakable)))
          a.sendAlexa(['primaryZoneDeclare',currentZone]);
        })
        .fail(function(err) {
          app.intentErr(req,res,err);
        });
    	}
    );
  }
  callback(intentDictionary);
};
