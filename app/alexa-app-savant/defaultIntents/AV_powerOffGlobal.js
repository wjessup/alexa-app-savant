const
  savantLib = require('../lib/savantLib'),
  _ = require('lodash'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'powerOffGlobal',
    'version' : '3.0',
    'description' : 'Power off all zones',
    'enabled' : 1,
    'required' : {
      'resolve': {},
      'test':{}
    },
    'voiceMessages' : {
      'success': 'Turning off all zones'
    },
    'slots' : {},
    'utterances' : ['{actionPrompt} everything off', '{actionPrompt} off all zones', '{actionPrompt} off everything'],
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
          log.error("req: "+req)
    			savantLib.serviceRequest(['','PowerOff'],'zone');//Turn off zone
          a.sendAV([intentDictionary.placeholder.zone,'Zone','PowerOff']);
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',intentDictionary.voiceMessages.success))
        })
        .fail(function(err) {
          log.error("err: "+err)
          app.intentErr(req,res,err);
        });
    }
    );
  }
  callback(intentDictionary);
};
