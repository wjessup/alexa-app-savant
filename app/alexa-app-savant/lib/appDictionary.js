var zoneParse = require('./zoneParse');

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
		"actionPrompt":["Turn","Set","Switch","Power"],
		"disablePrompt":["disable","turn off", "stop"],
		"enablePrompt":["enable","turn on","start","I want to Listen to","I want to watch","I want to"],
		"services":["Plex","Roku","Tivo","Apple TV","Sonos","Video"],
		"rangePrompt":["High","Medium","Low"]
	};

	zoneParse.getZones(zoneInfo, function (err, systemZones) {
		//console.log(systemZones);
		obj.systemZones = systemZones;
		//console.log(obj);
		app.dictionary = obj;
	});
};
