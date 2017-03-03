'use strict';

const
	alexa = require('alexa-app'),
	path = require('path');



var
	config = require('./userFiles/config'),
	app = new alexa.app(skillName); // Define an alexa-app

	require('./lib/environmentLib')(app);
	app.getSavantVersion()
		.then (function (ret){
			app.environment = ret;
			require('./lib/appDictionary')(app); //Setup appDictionary
			require('./lib/alexaSessionLib')(app); //Things to do pre/post session
			require('./lib/loadIntents')(app); //Import intents from default and user dir
			require('./lib/currentZoneLib'); //Recall currentZone from Savant
			require('./lib/amazon_IoT'); //Use amazon IoT buttons with skill
		});


module.exports = app;
