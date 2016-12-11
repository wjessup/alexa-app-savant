var alexa = require('alexa-app');
var didYouMean = require('didYouMean');
var dnode = require('dnode');
var path = require('path')

var zoneParse = require('./zoneParse');
var savantLib = require('./savantLib');
var config = require('./config');

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

// Define an alexa-app
var app = new alexa.app(skillName);
app.launch(function(req,res) {
	res.say(skillName);
});

//Import all intents from /defaultIntents folder
var defaultIntentsPath = require("path").join(__dirname, "/defaultIntents/");
require("fs").readdirSync(defaultIntentsPath).forEach(function(file) {
  if (path.extname(file) === ".js") {
    require(defaultIntentsPath + file)(app,function(loadedIntent){
      if (loadedIntent.intentEnabled === 1){
				console.log('Importing Default Intent: '+ loadedIntent.intentName + ', Version: '+ loadedIntent.intentVersion);
			}else{
				console.log('Skipping Default Intent: '+ loadedIntent.intentName + ', Version: '+ loadedIntent.intentVersion);
			}
    });
  }

});

//Import all intents from /customIntents folder
var customIntentsPath = require("path").join(__dirname, "/customIntents/");
require("fs").readdirSync(customIntentsPath).forEach(function(file) {
  if (path.extname(file) === ".js") {
    require(customIntentsPath + file)(app,function(loadedIntent){
			if (loadedIntent.intentEnabled === 1){
				console.log('Importing Custom Intent: '+ loadedIntent.intentName + ', Version: '+ loadedIntent.intentVersion);
			}else{
				console.log('Skipping Custom Intent: '+ loadedIntent.intentName + ', Version: '+ loadedIntent.intentVersion);
			}
    });
  }
});

//Import all intents from /userIntents folder
var userIntentsPath = require("path").join(__dirname, "/userIntents/");
require("fs").readdirSync(userIntentsPath).forEach(function(file) {
  if (path.extname(file) === ".js") {
    require(userIntentsPath + file)(app,function(loadedIntent){
			if (loadedIntent.intentEnabled === 1){
				console.log('Importing User Intent: '+ loadedIntent.intentName + ', Version: '+ loadedIntent.intentVersion);
			}else{
				console.log('Skipping User Intent: '+ loadedIntent.intentName + ', Version: '+ loadedIntent.intentVersion);
			}
    });
  }
});



//Dictionary of prompt phases to be used in utterances
app.dictionary = {
	//
	//
	// Enter your savant zone names in here
	"systemZones":["Kitchen","Family Room","Dining Room","Living Room","Master Bedroom","Office","Rear Yard"],
	//
	//
	"movementPrompt":["move","tell","send","ask"],
	"speedPrompt":["high","medium","low","on","off"],
	"applicationType":["channel","motor","shade","blind"],
	"scenePrompt":["run","excecute","play"],
	"openMovementPrompt":["open","lift","raise"],
	"closeMovementPrompt":["close","drop","lower"],
	"hvacSystemPrompt":["HVAC","A.C.","H.V.A.C.","house","system"],
	"hvacModes":["Heat","Cool","AC","Off","On","auto"],
	"actionPrompt":["Turn","Set","Switch","Power"],
	"disablePrompt":["disable","turn off", "stop"],
	"enablePrompt":["enable","turn on","start"],
	"services":["Plex","Roku","Tivo","Apple TV","Sonos"],
	"rangePrompt":["High","Medium","Low"]
};

////////////////////////////////////////////////////////////////////////
//
// Custom Savant Intents - These will need some tweaking to make them work on your system
//
////////////////////////////////////////////////////////////////////////

/////////////////
// HVAC Intents
/////////////////

// Get current temperature for one zone
app.intent('queryCurrentTemperature', {
		"slots":{"currentTemp":"NUMBER"}
		,"utterances":["what is the current temperature"]
	},function(req,res) {
		//Get Current Temp state
		savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentTemperature_'+tstatScope[5], function(currentTemp) {
			console.log('queryCurrentTemperature Intent: The current temperature is '+ currentTemp +' degrees');
			res.say("The current temperature is "+ currentTemp +" degrees").send();
		});
		return false;
	}
);

// Get current cool point for one zone
app.intent('queryCoolSetPoint', {
		"slots":{"currentTemp":"NUMBER"}
		,"utterances":["what is the current Cool set point"]
	},function(req,res) {
		//query cool point state
		savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentCoolPoint_'+tstatScope[5], function(currentTemp) {
			console.log('queryCoolSetPoint Intent: The Cool Point is currently set to '+ currentTemp +' degrees');
			res.say("The Cool Point is currently set to "+ currentTemp +" degrees").send();
		});
		return false;
	}
);

// Get current heat point for one zone
app.intent('queryHeatSetPoint', {
		"slots":{"currentTemp":"NUMBER"}
		,"utterances":["what is the current Heat set point"]
	},function(req,res) {
		//query heat point state
		savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentHeatPoint_'+tstatScope[5], function(currentTemp) {
			console.log('queryHeatSetPoint Intent: The Heat Point is currently set to '+ currentTemp +' degrees');
			res.say("The Heat Point is currently set to "+ currentTemp +" degrees").send();
		});
		return false;
	}
);

// Get current mode for one zone
app.intent('queryHVACMode', {
		"slots":{}
		,"utterances":["what mode is the HVAC in"]
	},function(req,res) {
		//query HVAc mode state
		savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatMode_'+tstatScope[5], function(currentMode) {
			console.log('queryHVACMode Intent: The mode is currently set to '+ currentMode);
			res.say('The mode is currently set to '+ currentMode).send();
		});
		return false;
	}
);

//Set HVAC Mode for one zone
app.intent('setHVACMode', {
		"slots":{"modeToSet":"LITERAL"}
		,"utterances":["{actionPrompt} {hvacSystemPrompt} to {hvacModes|modeToSet}"]
	},function(req,res) {
		//query HVAC mode to compare. if it matches request fail
		savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatMode_'+tstatScope[5], function(currentMode) {
			//console.log("The Current mode is: "+(currentMode).toLowerCase());
			//console.log("The requested mode is: "+req.slot('modeToSet').toLowerCase());
			if (((currentMode).toLowerCase()) == (req.slot('modeToSet').toLowerCase())) {
				res.say('The system is already in '+ currentMode +' Mode').send();
				return false;
			}

			//Match request with servicerequest
			switch (req.slot('modeToSet').toLowerCase()){
				case "heat":
					savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
					savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeHeat","ThermostatAddress",tstatScope[5]],"full");
				break;
				case "cool":
					savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
					savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeCool","ThermostatAddress",tstatScope[5]],"full");
				break;
				case "off":
					savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
					savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeOff","ThermostatAddress",tstatScope[5]],"full");
				break;
				case "auto":
					savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
					savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeAuto","ThermostatAddress",tstatScope[5]],"full");
				break;
				case "on":
					//get current temperature state, decide what to do based on current temperature
					savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentTemperature_'+tstatScope[5], function(currentTemp) {
						//console.log("Back in Function with data:  " +currentTemp);
						if (currentTemp>68){
							savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
							savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeCool","ThermostatAddress",tstatScope[5]],"full");
						}
						if (currentTemp<68){
							savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
							savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHVACModeHeat","ThermostatAddress",tstatScope[5]],"full");
						}
					});
				break;
			}
		});
		console.log('queryHVACMode Intent: Setting system mode to '+ req.slot('modeToSet'));
		res.say('Setting system mode to '+ req.slot('modeToSet')).send();
		return false;
	}
);

// Set current heat point in one zone
app.intent('setHeatPointTemperature', {
		"slots":{"tempToSet":"NUMBER"}
		,"utterances":["{actionPrompt} heat to {65-85|tempToSet} {degrees |}"]
	},function(req,res) {
		//get current heatpoint, check againts request and decide what to do
		savantLib.readState(tstatScope[1]+'.'+tstatScope[2]+'.ThermostatCurrentHeatPoint_'+tstatScope[5], function(currentSetPoint) {
			//console.log("The Current Set point is: "+currentSetPoint);
			//console.log("The requested Set point is: "+req.slot('tempToSet'));
			if (currentSetPoint == req.slot('tempToSet') ){
				console.log('setHeatPointTemperature Intent: The current set point is already '+ currentSetPoint);
				res.say('The heat is already '+ currentSetPoint).send();
			} else {
				console.log('setHeatPointTemperature Intent: Setting setpoint to'+ req.slot('tempToSet'));
				savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
				savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetHeatPointTemperature","HeatPointTemperature",req.slot('tempToSet')],"full");
				res.say('Setting heat setpoint to'+ req.slot('tempToSet')).send();
			}
		});
		return false;
	}
);

// Set current cool point in one zone
app.intent('setCoolPointTemperature', {
		"slots":{"tempToSet":"NUMBER"}
		,"utterances":["{actionPrompt} {AC|A.C.|cooling} to {65-85|tempToSet} {degrees |}"]
	},function(req,res) {
		//get current heatpoint, check againts request and decide what to do
		savantLib.readState('Savant SSTW100.HVAC_controller.ThermostatCurrentCoolPoint_1', function(currentSetPoint) {
			//console.log("The Current Set point is: "+currentSetPoint);
			//console.log("The requested Set point is: "+req.slot('tempToSet'));
			if (currentSetPoint == req.slot('tempToSet') ){
				console.log('setCoolPointTemperature Intent: The AC is already '+ currentSetPoint);
				res.say('The AC is already '+ currentSetPoint).send();
			} else {
				console.log('setCoolPointTemperature Intent: Setting AC to'+ req.slot('tempToSet'));
				savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"PowerOn"],"full");
				savantLib.serviceRequest([tstatScope[0],tstatScope[1],tstatScope[2],tstatScope[3],tstatScope[4],"SetCoolPointTemperature","CoolPointTemperature",req.slot('tempToSet')],"full");
				res.say('Setting AC to'+ req.slot('tempToSet')).send();
			}
		});
		return false;
	}
);


/////////////////
// Ceiling Fan Intents
/////////////////
app.intent('fanSpeed', {
		"slots":{"SPEED":"LITERAL"}
		,"utterances":["{actionPrompt} {kitchen |} fan {to |} {speedPrompt|SPEED}","{actionPrompt} {on|off|SPEED} the {kitchen |} fan"]
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

		console.log('fanSpeed Intent: Setting fan to '+req.slot('SPEED'));
		savantLib.serviceRequest([SPEED],"custom");
		res.say('Setting fan to '+req.slot('SPEED')).send();
		return false;
	}
);

/////////////////
// User preset Intents
/////////////////
app.intent('turnOnMickey', {
		"slots":{"ZONE":"LITERAL"}
		,"utterances":["Turn on mickey"]
	},function(req,res) {

		savantLib.serviceRequest(["Lutron_KitchenAV_On"],"custom");

		console.log('turnOnMickey Intent: Turning on Mickey');
		res.say('Turning on Mickey').send();
		return false;
	}
);

app.intent('turnOnSanta', {
		"slots":{"ZONE":"LITERAL"}
		,"utterances":["Turn on santa","make santa talk"]
	},function(req,res) {

		savantLib.serviceRequest(["Santa"],"custom");

		console.log('turnOnSanta Intent: Santa');
		res.say('').send();
		return false;
	}
);

/////////////////
// amazon IoT Intents
/////////////////

//set Savant States
console.log('Setting up fletch button');
savantLib.writeState("userDefined.fletchButton",1);

//start dnode
var server = dnode({
    customRequest : function (s, cb) {
			cb(
				savantLib.readState("userDefined.fletchButton" ,function(fletchButton) {
					console.log("look what i found (fletch button): "+ fletchButton);
					if (fletchButton == 1){
						savantLib.readState('Kitchen.ZoneIsActive', function(isActive) {
							console.log("look what i found : "+isActive);
							if (isActive == 0) {
								savantLib.serviceRequest([s],"custom");
							} else {
								savantLib.serviceRequest(["Kitchen","PowerOff"],"zone");
							}
						})
					} else {
						console.log("button disabled, do nothing.");
						//FEEDBACK
					}
				})
			)
    }
});
server.listen(5004);


app.intent('disableFletchButton', {
		"slots":{}
		,"utterances":["{disablePrompt} {fletch|fletcher |} button"]
	},function(req,res) {
		console.log('disableFletchButton Intent: Fletchers Button is now disabled');
		savantLib.writeState("userDefined.fletchButton",0);
		res.say('Fletchers Button is now disabled').send();
		return false;
	}
);


app.intent('enableFletchButton', {
		"slots":{}
		,"utterances":["{enablePrompt} {fletch|fletcher |} button"]
	},function(req,res) {
	console.log('enableFletchButton Intent: Fletchers Button is now enabled');
	savantLib.writeState("userDefined.fletchButton",1);
	res.say('Fletchers Button is now enabled').send();
	return false;
	}
);

app.intent('queryFletchButton', {
		"slots":{}
		,"utterances":["is {fletchs|fletchers |} button {enabled|disabled}","what is the state of {fletchs|fletchers |} button"]
	},function(req,res) {
		//Check and inform user of status of IoT Button
		savantLib.readState("userDefined.fletchButton" ,function(fletchButton) {
			if (fletchButton==1){
				console.log('queryFletchButton Intent: Fletchers Button is enabled');
				res.say('Fletchers Button is enabled').send();
			}else {
				console.log('queryFletchButton Intent: Fletchers Button is currently disabled');
				res.say('Fletchers Button is currently disabled').send();
			};
		});
		return false;
	}
);



module.exports = app;
