const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'powerOff',
    'version' : '3.0',
    'description' : 'Power off requested zone AV or lighting (lights in a defined AV zone using Savants __RoomSetBrightness workflow)',
    'enabled' : 1,
    'required' : {
      'resolve': ['zoneWithZone','zoneWithService'],
      'test':{
        '1' : {'scope': 'zone', 'attribute': 'actionable'},
        '2' : {'scope': 'zone', 'attribute': 'speakable'}
      },
      'failMessage': ['zoneService']
    },
    'voiceMessages' : {
      'success': {
        'lighting': 'Turning off lights in {0}',
        'av': 'Turning off {0}'
      }
    },
    'slots' : {'ZONE':'ZONE','ZONE_TWO':'ZONE_TWO','LIGHTING':'LIGHTING'},
    'utterances' : [
      '{actionPrompt} off',
      '{actionPrompt} off {-|ZONE}','{actionPrompt} {-|ZONE} off','{actionPrompt} {-|ZONE} and {-|ZONE_TWO} off',
      '{actionPrompt} off {-|LIGHTING}',
      '{actionPrompt} off {-|ZONE} {-|LIGHTING}','{actionPrompt} off {-|ZONE} and {-|ZONE_TWO} {-|LIGHTING}',
      '{actionPrompt} {-|LIGHTING} off in {-|ZONE}','{actionPrompt} {-|LIGHTING} off in {-|ZONE} and {-|ZONE_TWO}'
    ]
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
              log.error(intentDictionary.name+' - intent not run verify failed')
              return
            }
            if (req.slot('LIGHTING')){ //if lighting lights or light was heard, run lighting worklow
              a.sendLighting([zone,'Off',req.slot('LIGHTING')]);
              return action.setLighting(zone.actionable,0,'percent')
              .thenResolve(format(intentDictionary.voiceMessages.success['lighting'],zone.speakable));
            }else{ // Do AV action (Lighting was not heard)
              a.sendAV([zone,'Zone','PowerOff']);
              return action.powerOffAV(zone.actionable)
              .thenResolve(format(intentDictionary.voiceMessages.success['av'],zone.speakable));
            }
          })
          .then(function(voiceMessage) {
            app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',voiceMessage))
          })
          .fail(function(err) {
            app.intentErr(req,res,err);
          });
      }
    );
  }
  callback(intentDictionary);
};
