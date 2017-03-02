const
	zoneParse = require('./zoneParse'),
	commandLib = require('./commandLib.json'),
	_ = require('lodash')
 	eventAnalytics = require('./eventAnalytics');

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
		"thingPrompt":["tv","speakers","video","audio","music"],
		"serviceCommands": _.keys(commandLib),
		"channelAction": ["Switch","tune","change"]
	};
	app.usedSlots = {"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO","LIGHTING":"LIGHTING","RANGE":"RANGE","PERCENTAGE":"PERCENTAGE","SERVICE":"SERVICE","tempToSet":"NUMBER","modeToSet":"LITERAL"}
//["Play","Pause","Up","Down","Left","Right","ok","enter","Select","Back","Exit","Return","off","power off","on","power on"]


	zoneParse.getZoneOrganization(globalZoneOrganization)
	.then(function(groupDictionary) {
		//log.error("groupNames: "+groupDictionary[1]);
		app.dictionary.systemGroupNames = groupDictionary[1];
		app.dictionary.systemGroups = groupDictionary[0];
		appDictionaryGroups = groupDictionary[0];
		appDictionaryGroupArray = _.values(app.dictionary.systemGroupNames);
		appDictionaryGroupArrayLowerCase = _.map(appDictionaryGroupArray, function(item) { return _.toLower(item); });
		//log.error("app.dictionary.systemGroupNames: "+app.dictionary.systemGroupNames);
		//log.error("app.dictionary.systemGroups: "+ JSON.stringify(app.dictionary.systemGroups));
		//log.error("appDictionaryGroupArray: "+appDictionaryGroupArray);
		//log.error("appDictionaryGroupArrayLowerCase: "+appDictionaryGroupArrayLowerCase);
	});

	zoneParse.getZones(serviceOrderPlist)
	.then(function(systemZones) {
		app.dictionary.systemZones = systemZones;
		appDictionaryArray = _.values(app.dictionary.systemZones);
		appDictionaryArrayLowerCase = _.map(appDictionaryArray, function(item) { return _.toLower(item); });
		//log.error("app.dictionary.systemZones: "+ JSON.stringify(app.dictionary.systemZones));
		//log.error("appDictionaryArray: "+appDictionaryArray);
		//log.error("appDictionaryArrayLowerCase: "+ appDictionaryArrayLowerCase);
	});


	zoneParse.getZoneServices(serviceOrderPlist)
	.then(function(foundservices) {
		systemServices = foundservices;
		//log.error("systemServices: "+JSON.stringify(systemServices));
	});

  zoneParse.getServiceNames(serviceOrderPlist)
  .then(function(systemServices) {
    app.dictionary.services = systemServices;
		appDictionaryServiceNameArray = _.values(app.dictionary.services);
		//log.error("app.dictionary.services: "+app.dictionary.services);
  });

	zoneParse.getChannels(channelsByService)
  .then(function(channelsByService) {
    appDictionaryChannels = channelsByService[0];
		appDictionaryChannelsArray = channelsByService[1]
		//log.error("appDictionaryChannels: "+JSON.stringify(appDictionaryChannels));
  });


	var _dictionaryCheck = setInterval(function() {
	    if (typeof app.dictionary.services != 'undefined' && typeof app.dictionary.systemZones != 'undefined') {
	        clearInterval(_dictionaryCheck);
	        require('./customSlotFile')(app);
					require('./userPresets')(app);
					eventAnalytics.systemAnalytics();
			}
	}, 10);


};
