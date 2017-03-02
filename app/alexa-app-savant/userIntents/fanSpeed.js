//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'name' : 'fanSpeed',
    'version' : '1.0',
    'description' : 'Control fan with presets high/med/low as well as on/off',
    'enabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.enabled === 1){

//Intent
    app.intent('fanSpeed', {
    		"slots":{"SPEED":"LITERAL"}
    		,"utterances":["{actionPrompt} {kitchen |} fan to {speedPrompt|SPEED}","{actionPrompt} {on|off|SPEED} the {kitchen |} fan"]
    	},function(req,res) {
    		//check request as asign workflow
    		switch (req.slot('SPEED').toLowerCase()){
    		case "high":
    			SPEED = 'HVAC_KitchenFan_High';
    			break;
    		case "medium":
    			SPEED = 'HVAC_KitchenFan_Med';
    			break;
    		case "low":
    			SPEED = 'HVAC_KitchenFan_Low';
    			break;
    		case "on":
    			SPEED = 'HVAC_KitchenFan_Med';
    			break;
    		case "off":
    			SPEED = 'HVAC_KitchenFan_Off';
    			break;
    		default:
    			res.say('I didnt understand please try again. Say On,Off,High,Medium,or Low').send();
    			return false;
    			break;
    		}

    		log.error('fanSpeed Intent: Setting fan to '+req.slot('SPEED'));
    		savantLib.serviceRequest([SPEED],"custom");
    		res.say('Setting fan to '+req.slot('SPEED')).send();
    		return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
