const
  savantLib = require('../lib/savantLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'disableFletchButton',
    'version' : '3.0',
    'description' : 'Disable state of amazon IOT button',
    'enabled' : 1,
    'required' : {
      'resolve': {},
      'test':{}
    },
    'voiceMessages' : {
      'success': 'Fletchers Button is now disabled'
    },
    'slots' : {},
    'utterances' : ["disable {fletch|fletcher|fletcher's |} button"],
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
          savantLib.writeState("userDefined.fletchButton",0);
          a.sendAlexa(['FletchButton',"disable"]);
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',intentDictionary.voiceMessages.success))
        })
        .fail(function(err) {
          app.intentErr(req,res,err);
        });
    }
    )
  }
  callback(intentDictionary);
};
