const
  savantLib = require('../lib/savantLib'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'queryCoolSetPoint',
    'version' : '3.0',
    'description' : 'Get current cool point temperature for single HVAC zone. NOTE: change tstatScope in config file',
    'enabled' : 1,
    'required' : {
      'resolve': [],
      'test': {}
    },
    'voiceMessages' : {
      'success': 'The AC is currently set to {0} degrees'
    },
    'slots' : {},
    'utterances' : ['what is the current Cool {set |} {point |}', 'what is the a.c. set to']
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function (){
          return savantLib.readStateQ(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentCoolPoint_'+tstatScope[5])
        })
        .then(function (stateValue){
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',format(intentDictionary.voiceMessages.success,stateValue)))
          a.sendHVAC(['ThermostatCurrentCoolPoint_',stateValue]);
        })
        .fail(function(err) {
          app.intentErr(req,res,err);
        });
    }
    );
  }
  callback(intentDictionary);
};
