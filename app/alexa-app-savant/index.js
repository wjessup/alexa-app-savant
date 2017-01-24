var alexa = require('alexa-app');
var path = require('path');

var config = require('./userFiles/config');
var amazonIoT = require('./lib/amazon_IoT'); //enable to use amazon IoT buttons with skill
var savantLib = require('./lib/savantLib');



// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

// Define an alexa-app
var app = new alexa.app(skillName);
app.launch(function(req,res) {
	res.say("Welcome to your Savant System");
});

var appDictionary  = require('./lib/appDictionary')(app);

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

//recall currentZone
if (currentZone === false){
  currentZone = savantLib.readState("userDefined.currentZone",function(currentZone) {
		setcurrentZone(currentZone);
	});
}
function setcurrentZone(zoneIn){
	if (zoneIn === "" ||zoneIn === "false"){
		zoneIn = false;
	}
	currentZone = zoneIn;
	console.log('Recalling currentZone from Savant: '+currentZone);
};

module.exports = app;
