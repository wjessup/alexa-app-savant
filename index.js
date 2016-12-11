var alexa = require('alexa-app');
var path = require('path')

var config = require('./config');
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

module.exports = app;
