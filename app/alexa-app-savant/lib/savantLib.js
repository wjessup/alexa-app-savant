const
	eventAnalytics = require('./eventAnalytics'),
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
writeState: writeState
}
