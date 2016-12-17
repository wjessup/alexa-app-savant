var zoneParse = require('./zoneParse');
var _ = require('lodash');

GLOBAL.appDictionaryArray = [];

module.exports = function(app){
	obj = {
		"movementPrompt":["move","tell","send","ask"],
		"speedPrompt":["high","medium","low","on","off"],
		"applicationType":["channel","motor","shade","blind"],
		"scenePrompt":["run","excecute","play"],
		"openMovementPrompt":["open","lift","raise"],
		"closeMovementPrompt":["close","drop","lower"],
		"hvacSystemPrompt":["HVAC","A.C.","H.V.A.C.","house","system"],
		"hvacModes":["Heat","Cool","AC","Off","On","auto"],
		"actionPrompt":["Turn","Set","Switch","Power","Start"],
		"disablePrompt":["disable","turn off", "stop"],
		"enablePrompt":["enable","turn on","start","I want to Listen to","I want to watch","switch"],
		"rangePrompt":["High","Medium","Low"],
		"increasePrompt":["raise","increase"],
		"decreasePrompt":["lower","decrease"],
		};

	zoneParse.getZones(zoneInfo, function (err, systemZones) {
		//console.log(systemZones);
		obj.systemZones = systemZones;
		//console.log(obj);
		app.dictionary = obj;

		appDictionaryArray = _.values(app.dictionary.systemZones);

		console.log('Slot Type: ZONE');
		console.log('');
		console.log('Slot Value:');
		//console.log(app.dictionary.systemZones);
		for (var key in app.dictionary.systemZones){
			console.log(app.dictionary.systemZones[key]);
		};
	});

	console.log (serviceOrderPlist);
	zoneParse.getServiceNames(serviceOrderPlist, function (err, systemServices){
		//console.log(systemServices);
		obj.services = systemServices;
		//console.log(obj);
		app.dictionary = obj;

		console.log('');
		console.log('');

		console.log('Slot Type: SERVICE');
		console.log('');
		console.log('Slot Value:');
		//console.log(app.dictionary.services);
		for (var key in app.dictionary.services){
			console.log(app.dictionary.services[key]);
			};
	});
};
