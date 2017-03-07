const
  savantLib = require('../lib/savantLib'),
  _ = require('lodash'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'setCoolPointTemperature',
    'version' : '3.0',
    'description' : 'Set current cool point for single HVAC zone. NOTE: change tstatScope in config file',
    'enabled' : 1,
    'required' : {
      'resolve': [],
      'test':{},
      'failMessage': []//['zoneService']
    },
    'voiceMessages' : {
      'success': 'Setting AC to {0} degrees',
      'error':{
        'outOfRange' : 'I didnt understand please try again. Say a number between 60 and 90',
        'requestMatchCurrent' : 'The AC is already set to {0}'
      }
    },
    'slots' : {'tempToSet':'NUMBER'},
    'utterances' : ['{actionPrompt} {AC|A.C.|cooling} to {60-90|tempToSet} {degrees |}']
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {
          if (req.slot('tempToSet')< 59 ||req.slot('tempToSet')>91){//check requested temp
            throw app.builderErr(intentDictionary.name,'endSession',intentDictionary.voiceMessages.error.outOfRange,'outOfRange')
          }
        })
        .then(function(tempToSet){
          return savantLib.readStateQ(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentCoolPoint_'+tstatScope[5])
        })
        .then(function(currentSetPoint){
          a.sendHVAC(['ThermostatCurrentCoolPoint_',currentSetPoint]);
          if (currentSetPoint == req.slot('tempToSet') ){
            throw app.builderErr(intentDictionary.name,'endSession',format(intentDictionary.voiceMessages.error.requestMatchCurrent,currentSetPoint),'requestMatchCurrent')
          }
          //savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],'PowerOn'],'full');
          savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],'SetCoolPointTemperature','ThermostatAddress',tstatScope[5],'CoolPointTemperature',req.slot('tempToSet')],'full');
          a.sendHVAC(['SetCoolPointTemperature',req.slot('tempToSet')]);
          return format(intentDictionary.voiceMessages.success,req.slot('tempToSet'))
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
