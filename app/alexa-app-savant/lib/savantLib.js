const
	eventAnalytics = require('./eventAnalytics'),
	_ = require('lodash'),
	q = require('q');

function serviceRequest(requestIn,typeIn,argumentIn,argumentValueIn){
	log.debug("serviceRequest sending:"+requestIn);
	switch (typeIn.toLowerCase()){
	case "zone":
		//only pass [zone,request]
		requestToSend=["servicerequest \""+requestIn[0]+"\" \"\" \"\" \"\" \"\" \""+requestIn[1]+"\""];
		break;
	case "volume":
		//only pass [zone,request]
		requestToSend=["servicerequest \""+requestIn[0]+"\" \"\" \"\" \"\" \"\" \"SetVolume\" \"VolumeValue\" \""+argumentValueIn[0]+"\""];
		break;
	case "custom":
		//only pass request and asume its in dining genric
		requestToSend=["servicerequest \""+customWorkflowScope[0]+"\" \""+customWorkflowScope[1]+"\" \"\" \"1\" \"SVC_GEN_GENERIC\" \""+requestIn[0]+"\""];
		break;
	case "lighting":
		//pass zone and %
		requestToSend=["servicerequest \""+requestIn[0]+"\" \"\" \"\" \"\" \"SVC_ENV_LIGHTING\" \"__RoomSetBrightness\" \"BrightnessLevel\" \""+argumentValueIn[0]+"\""];
		break;
	case "full":
		//build full string in function call
		requestToSend="servicerequest \""+requestIn.join("\" \"")+"\"";
		log.debug(requestToSend);
		break;
	}
	requestString=requestToSend;
	sendToSCLI(requestString);
}

function readState(stateIn,callback){
	var a = new eventAnalytics.event();
	log.debug("savantLib.readState - Looking for state: \""+ stateIn + "\"");
  sendToSCLI("readstate \""+ stateIn + "\"",function(response){
  	log.debug("savantLib.readState - response: "+response);
		response = response.replace(/(\r\n|\n|\r)/gm,"");
		a.sendTime("readState",stateIn);
  	callback(response,stateIn);
  });
}

function readStateQ(stateIn) {
  var defer = q.defer();
  readState(stateIn, function(stateValue) {
    defer.resolve(stateValue);
  });
  return defer.promise;
}
function readMultipleState(stateIn,callback){
	var a = new eventAnalytics.event();
	log.debug("savantLib.readMultipleState - Looking for state: \""+ stateIn + "\"");
  sendToSCLI("readstate \""+ stateIn + "\"",function(response){
  	log.debug("savantLib.readMultipleState - Readstate response: "+response);
		response = response.split(/\n/);
		response = response.filter(function(x){//remove emmpty
      return (x !== (undefined || ''));
    });
		a.sendTime("readMultipleState",stateIn);
  	callback(response,stateIn);
  });
}
function readMultipleStateQ(stateIn) {
  var defer = q.defer();
  readMultipleState(stateIn, function(stateValue) {
    defer.resolve(stateValue);
  });
  return defer.promise;
}

function writeState(stateIn,valueIn){
	requestString=("writestate \""+ stateIn + "\" \"" + valueIn + "\"");
	log.debug("savantLib.writeState - Requesting state: "+requestString);
	sendToSCLI(requestString);
return
}

function getSceneNames(){
	var a = new eventAnalytics.event();
	var defer = q.defer();
	log.debug("savantLib.getSceneNames - Requesting scenes");
	sendToSCLI("getSceneNames",function(response){
  	log.debug("savantLib.getSceneNames - getSceneNames response: "+response);
		response = response.split(/\n/);
		response = response.filter(function(x){//remove emmpty
      return (x !== (undefined || ''));
    });
		/*response = ["firepit time,148CF1A8-84E9-4966-B006-0E7C497A6960,paul@ecny.net",
			"Dinner time ,F621917A-2661-4CF8-A447-BC2176BE7339,paul@ecny.net",
			"Dayna Days,5993742D-1514-44AF-873F-7623F7C7A0DF,paul@ecny.net",
			"Tivo time compromise,E27511C2-09A6-4506-825C-C1FC98A5AB8A,paul@ecny.net",
			"Tivo Time,794A546E-3BB4-440D-9977-78E7C004125C,paul@ecny.net",
			"Holiday lighting,9687040D-032C-46D2-B652-2AAB6E134633,paul@ecny.net",
			"Kesha,7EC89FC6-FACE-4295-A491-1A5506C2F6C3,paul@ecny.net",
			"Date Night,48EB8778-F315-4FA5-B39C-CFB0ADB717DB,paul@ecny.net",
			"dinner guests holiday time  ,999B5994-2543-4109-8650-7DE2C28D3798,paul@ecny.net",
			"test scene 1,7577DCB7-4F5A-436B-8C88-13BB89883ECD,bochner",
			"all off,E4401866-C2B5-4FE1-BADC-033B8BFB9BDD,bochner",
			"Workout,D80F65E3-9779-47D4-9DF9-B4204A1AC875,bochner",
			"Workout,76480DC7-14B0-4024-AECF-4E0D16E23184,info@ecny.net",
			"All Off,D9E58702-C472-4A8C-AD93-E6818ED00B07,info@ecny.net"]
			*/
		var ret = {};
		for (var key in response){
			var scene = response[key];
			scene = scene.split(',');
			ret[scene[0]] = {
				name: scene[0],
				id: scene[1],
				user: scene[2]
			}
		}
		a.sendTime("getSceneNames");
  	defer.resolve(ret);
  });
return defer.promise;
}

function activateScene(scene){
	requestString=("activateScene \""+ scene.name + "\" \"" + scene.id + "\" \"" + scene.user + "\"");
	log.debug("activateScene.activateScene - Activating Scene: "+scene.name);
	sendToSCLI(requestString);
	return scene
return
}

function sendToSCLI (consoleString,callback){
	var a = new eventAnalytics.event();
	fullcommand = sclibridgePath +" "+ consoleString
	log.info("savantLib.sendToSCLI - Running:  "+ fullcommand);

	var child = require('child_process');
	var ps = child.exec(fullcommand, (error, stdout, stderr) =>{
		log.info('savantLib.sendToSCLI - SCLI Response: '+ stdout);
		if (error){
			log.error('savantLib.sendToSCLI - error: '+ error);
			log.error('savantLib.sendToSCLI - error.code: '+ error.code);
			log.error('savantLib.sendToSCLI - error.signal: '+ error.signal);
			log.error('savantLib.sendToSCLI - stderr: '+stderr);
		}
		if (typeof callback !== 'undefined'){
			a.sendTime("sendToSCLI",consoleString.substr(0,consoleString.indexOf(' ')));
			callback (stdout);
		};
	});
return
}


module.exports = {
serviceRequest: serviceRequest,
readState: readState,
readStateQ:readStateQ,
readMultipleState: readMultipleState,
readMultipleStateQ:readMultipleStateQ,
writeState: writeState,
getSceneNames:getSceneNames,
activateScene:activateScene
}
