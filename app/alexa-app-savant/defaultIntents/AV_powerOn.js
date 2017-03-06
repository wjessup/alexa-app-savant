const
  action = require('../lib/actionLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'powerOn',
    'version' : '3.0',
    'description' : 'Power on requested zone with last used service',
    'enabled' : 1,
    'required' : {
      'resolve': ['zoneWithZone','zoneWithService','rangeWithRange'],
      'test':{
        '1' : {'scope': 'zone', 'attribute': 'actionable'},
        '2' : {'scope': 'zone', 'attribute': 'speakable'}
      },
      'failMessage': []//zoneService
    },
    'voiceMessages' : {
      'success': {
        'lighting': 'Turning on lights in {0}',
        'lightingRange': 'Setting lights to {0} in {1}',
        'lightingPercent': 'Setting lights to {0} percent in {1}',
        'av': 'Turning on {0}'

      }
    },
    'slots' : {'ZONE':'ZONE','ZONE_TWO':'ZONE_TWO','LIGHTING':'LIGHTING','RANGE':'RANGE','PERCENTAGE':'PERCENTAGE'},
    'utterances' : [
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

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {
          if (_.get(req.sessionAttributes,'error',{}) === 0){
            var zone = _.get(req.sessionAttributes,'zone',{});
            var prams = _.get(req.sessionAttributes,'prams',{});
          }else {
            log.error(intentDictionary.name+' - intent not run verify failed')
            return
          }
          //If not a lighting request turn on last used AV source
          if ((!req.slot('LIGHTING')) && (!prams.range) && (!req.slot('PERCENTAGE'))){
            a.sendAV([zone,'Zone','PowerOn']);
            log.error(intentDictionary.name+' Intent - not a lighting request turn on last used AV source');
            return action.lastPowerOn(zone.actionable)//Get last service and turn on in all cleanZones
            .thenResolve(format(intentDictionary.voiceMessages.success['av'],zone.speakable));
          }

          //If a lighting request with range, turn on lights with requested range
          if (req.slot('LIGHTING') && prams.range){
            a.sendLighting([zone,prams.range,req.slot('LIGHTING')]);
            log.error(intentDictionary.name+' Intent - a lighting request with range, turn on lights with requested range');
            return action.setLighting(zone.actionable,prams.range,'range')//set lights to range in all cleanZones
            .thenResolve(format(intentDictionary.voiceMessages.success['lightingRange'],prams.range,zone.speakable));
  			  }

          //if a lighting request with a percentage, turn on lights with requested percentage
          if (req.slot('LIGHTING') && req.slot('PERCENTAGE') && (!prams.range)){
            a.sendLighting([zone,req.slot('PERCENTAGE'),req.slot('LIGHTING')]);
            log.error(intentDictionary.name+' Intent - a lighting request with a percentage, turn on lights with requested percentage');
            return action.setLighting(zone.actionable,req.slot('PERCENTAGE'),'percent')//set lights to percentage in all cleanZones
            .thenResolve(format(intentDictionary.voiceMessages.success['lightingPercent'],req.slot('PERCENTAGE'),zone.speakable));
          }

          //if a lighting request without a percentage or range, turn on light to preset value
          if (req.slot('LIGHTING') && (!req.slot('PERCENTAGE')) && (!prams.range)){
            a.sendLighting([zone,'On',req.slot('LIGHTING')]);
            log.error(intentDictionary.name+' Intent - a lighting request without a percentage or range, turn on light to preset value');
            return action.setLighting(zone.actionable,"on",'range')
            .thenResolve(format(intentDictionary.voiceMessages.success['lighting'],zone.speakable));
          }
          // need a catch here
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
