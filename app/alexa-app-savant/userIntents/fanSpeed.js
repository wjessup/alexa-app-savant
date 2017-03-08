const
  savantLib = require('../lib/savantLib'),
  format = require('simple-fmt'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'fanSpeed',
    'version' : '3.0',
    'description' : 'Control fan with presets high/med/low as well as on/off',
    'enabled' : 1,
    'required' : {
      'resolve': {},
      'test':{}
    },
    'voiceMessages' : {
      'success': 'Setting fan to {0}',
      'error' : 'I didnt understand please try again. Say On,Off,High,Medium,or Low'
    },
    'slots' : {"SPEED":"LITERAL"},
    'utterances' : ["{actionPrompt} {kitchen |} fan to {speedPrompt|SPEED}","{actionPrompt} {on|off|SPEED} {the |} {kitchen |} fan"],
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
      		switch (req.slot('SPEED').toLowerCase()){
      		case "high":
      			var fanSpeed = 'HVAC_KitchenFan_High';
      			break;
          case "hi":
      			var fanSpeed = 'HVAC_KitchenFan_High';
      			break;
      		case "medium":
      			var fanSpeed = 'HVAC_KitchenFan_Med';
      			break;
      		case "low":
      			var fanSpeed = 'HVAC_KitchenFan_Low';
      			break;
      		case "on":
      			var fanSpeed = 'HVAC_KitchenFan_Med';
      			break;
      		case "off":
      			var fanSpeed = 'HVAC_KitchenFan_Off';
      			break;
      		default:
            throw app.builderErr(intentDictionary.name,'endSession',intentDictionary.voiceMessages.error,'noSpeedMatch')
      			break;
      		}
          savantLib.serviceRequest([fanSpeed],"custom");
          app.intentSuccess(req,res,app.builderSuccess(intentDictionary.name,'endSession',format(intentDictionary.voiceMessages.success,req.slot('SPEED'))))
        })
        .fail(function(err) {
          app.intentErr(req,res,err);
        });
    }
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
