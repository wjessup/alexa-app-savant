const
	zoneParse = require('./zoneParse'),
	savantLib  = require('./savantLib'),
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
		"channelAction": ["Switch","tune","change"],
		"sceneAction" : ["recall","activate"]
	}



	//app.usedSlots = {"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO","LIGHTING":"LIGHTING","RANGE":"RANGE","PERCENTAGE":"PERCENTAGE","SERVICE":"SERVICE","tempToSet":"NUMBER","modeToSet":"LITERAL"}

	zoneParse.getZoneOrganization(globalZoneOrganization)
	.then(function(groupDictionary) {
		log.error("Building group list...")
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
	})
	.then(zoneParse.getZones.bind(null,serviceOrderPlist))
	.then(function(systemZones) {
		log.error("Building zone list...")
		app.dictionary.systemZones = systemZones;
		appDictionaryArray = _.values(app.dictionary.systemZones);
		appDictionaryArrayLowerCase = _.map(appDictionaryArray, function(item) { return _.toLower(item); });
		//log.error("app.dictionary.systemZones: "+ JSON.stringify(app.dictionary.systemZones));
		//log.error("appDictionaryArray: "+appDictionaryArray);
		//log.error("appDictionaryArrayLowerCase: "+ appDictionaryArrayLowerCase);
	})
	.then(zoneParse.getZoneServices.bind(null,serviceOrderPlist))
	.then (function(foundservices){
		log.error("Building service array library...")
			systemServices = foundservices;
			//log.error("systemServices: "+JSON.stringify(systemServices));
	})
	.then(zoneParse.getServiceNames.bind(null,serviceOrderPlist))
	.then (function(ret){
		log.error("Building service name list...")
		app.dictionary.sourceComponents = ret.sourceComponent
		app.dictionary.serviceAlias = ret.serviceAlias
		app.dictionary.services = ret.serviceAlias.concat(ret.sourceComponent)
		appDictionaryServiceNameArray = _.values(app.dictionary.services);
		//log.error("app.dictionary.services: "+app.dictionary.services);
	})
	.then(zoneParse.getChannels.bind(null,channelsByService))
	.then (function(channelsByService){
		log.error("Building favorite channel libray...")
    appDictionaryChannels = channelsByService[0];
		appDictionaryChannelsArray = channelsByService[1]
		//log.error("appDictionaryChannels: "+JSON.stringify(appDictionaryChannels));
	})
	.then(function(){

		if (app.environment.sceneSupport) {
			log.error("Building Scene list...")
			savantLib.getSceneNames()
			.then(function (ret){
				var scenes = _.uniq(_.keys(ret));
				for (var key in scenes){
					scenes[key] = scenes[key].replace(/[0-9]/g, '');
				}
				app.dictionary.sceneExample = scenes;
			});
		}else {
			log.error("Building Scene list...Skipping Running Savant version "+app.environment.version)
		}
	})
	.then (function(){
		log.error("Building customSlotFile...")
    require('./customSlotFile')(app);
		log.error("Loading User Presets...")
		require('./userPresets')(app);
		eventAnalytics.systemAnalytics();
	});
};
