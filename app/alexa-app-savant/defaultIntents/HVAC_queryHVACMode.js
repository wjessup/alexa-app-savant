const
  savantLib = require('../lib/savantLib'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'queryHVACMode',
    'version' : '3.0',
    'description' : 'Get current mode for single HVAC zone. NOTE: change tstatScope in config file',
    'enabled' : 1,
    'required' : {
      'resolve': [],
      'test': {}
    },
    'voiceMessages' : {
      'success': 'The system is currently set to {0}'
    },
    'slots' : {},
    'utterances' : ['what mode is the {hvacSystemPrompt} in','is the {hvacSystemPrompt} on','is the {hvacSystemPrompt} off']
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function (){
          return savantLib.readStateQ(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatMode_'+tstatScope[5])
        })
        .then(function (stateValue){
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',format(intentDictionary.voiceMessages.success,stateValue)))
          a.sendHVAC(['ThermostatMode_',stateValue]);
        })
        .fail(function(err) {
          app.intentErr(req,res,err);
        });
    }
    );
  }
  callback(intentDictionary);
};
