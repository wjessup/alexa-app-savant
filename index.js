var alexa = require('alexa-app');
var path = require('path');

var config = require('./lib/config');
var amazonIoT = require('./lib/amazon_IoT');


// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

// Define an alexa-app
var app = new alexa.app(skillName);
app.launch(function(req,res) {
	res.say(skillName);
});

var appDictionary  = require('./lib/appDictionary')(app);

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
//app.dictionary = GLOBAL.appDictionaryJSON;


module.exports = app;
