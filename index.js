var alexa = require('alexa-app');
var didYouMean = require('didYouMean');
var dnode = require('dnode');
var path = require('path')

var config = require('./config');
var zoneParse = require('./zoneParse');
var savantLib = require('./savantLib');
var amazonIoT = require('./amazon_IoT')


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


// Get current cool point for one zone


// Get current heat point for one zone


// Get current mode for one zone


//Set HVAC Mode for one zone

// Set current heat point in one zone


// Set current cool point in one zone



/////////////////
// Ceiling Fan Intents
/////////////////


/////////////////
// User preset Intents
/////////////////




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
