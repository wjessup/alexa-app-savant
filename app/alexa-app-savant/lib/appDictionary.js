var zoneParse = require('./zoneParse');
var _ = require('lodash');

appDictionaryArray = [];
zoneServices = {};

module.exports = function(app){
	app.dictionary = {
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
		"rangePrompt":["High","Hi","Medium","Low"],
		"increasePrompt":["raise","increase","turn up"],
		"decreasePrompt":["lower","decrease","turn down"],
		"lightingPrompt":["Lights","Light","lighting"],
		"thingPrompt":["TV","speakers","video","audio"],
		"serviceCommands":["Play","Pause","Up","Down","Left","Right","ok","enter","Select","Back","Exit","Return"]
	};

	zoneParse.getZoneOrganization(globalZoneOrganization)
	.then(function(groupDictionary) {
		console.log("groupNames: "+groupDictionary[1]);
		app.dictionary.systemGroupNames = groupDictionary[1];
		app.dictionary.systemGroups = groupDictionary[0];
		appDictionaryGroups = groupDictionary[0];
		appDictionaryGroupArray = _.values(app.dictionary.systemGroupNames);
		appDictionaryGroupArrayLowerCase = _.map(appDictionaryGroupArray, function(item) { return _.toLower(item); });
		//console.log("app.dictionary.systemGroupNames: "+app.dictionary.systemGroupNames);
		//console.log("app.dictionary.systemGroups: "+ JSON.stringify(app.dictionary.systemGroups));
		//console.log("appDictionaryGroupArray: "+appDictionaryGroupArray);
		//console.log("appDictionaryGroupArrayLowerCase: "+appDictionaryGroupArrayLowerCase);
	});

	zoneParse.getZones(serviceOrderPlist)
	.then(function(systemZones) {
		app.dictionary.systemZones = systemZones;
		appDictionaryArray = _.values(app.dictionary.systemZones);
		appDictionaryArrayLowerCase = _.map(appDictionaryArray, function(item) { return _.toLower(item); });
		//console.log("app.dictionary.systemZones: "+ JSON.stringify(app.dictionary.systemZones));
		//console.log("appDictionaryArray: "+appDictionaryArray);
		//console.log("appDictionaryArrayLowerCase: "+ appDictionaryArrayLowerCase);
	});


	zoneParse.getZoneServices(serviceOrderPlist)
	.then(function(foundservices) {
		appDictionaryZoneServices = foundservices;
		//console.log("foundservices "+foundservices);
		//console.log("foundservices "+JSON.stringify(foundservices));
	});

  zoneParse.getServiceNames(serviceOrderPlist)
  .then(function(systemServices) {
    app.dictionary.services = systemServices;
		appDictionaryServiceNameArray = _.values(app.dictionary.services);
		//console.log("app.dictionary.services: "+app.dictionary.services);
  });


	var _dictionaryCheck = setInterval(function() {
	    if (typeof app.dictionary.services != 'undefined' && typeof app.dictionary.systemZones != 'undefined') {
	        clearInterval(_dictionaryCheck);
	        var customSlot = require('./customSlotFile')(app);
			}
	}, 10);


};
