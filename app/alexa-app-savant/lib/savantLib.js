const
	eventAnalytics = require('../lib/eventAnalytics');

function serviceRequest(requestIn,typeIn,argumentIn,argumentValueIn){
	console.log("serviceRequest sending:"+requestIn);

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
		console.log("DEFULT");
		requestToSend="servicerequest \""+requestIn.join("\" \"")+"\"";
		console.log(requestToSend);
		break;
	}
	requestString=requestToSend;
	sendToSCLI(requestString);
}

function readState(stateIn,callback){
	var a = new eventAnalytics.event();
	console.log("Looking for state: \""+ stateIn + "\"");
  sendToSCLI("readstate \""+ stateIn + "\"",function(response){
  	console.log("Readstate response: "+response);
		response = response.replace(/(\r\n|\n|\r)/gm,"");
		a.sendTime(["readState",stateIn]);
  	callback(response,stateIn);
  });
}
function readMultipleState(stateIn,callback){
	var a = new eventAnalytics.event();
	console.log("Looking for state: \""+ stateIn + "\"");
  sendToSCLI("readstate \""+ stateIn + "\"",function(response){
  	console.log("Readstate response: "+response);
		response = response.split(/\n/);
		response = response.filter(function(x){//remove emmpty
      return (x !== (undefined || ''));
    });
		a.sendTime(["readMultipleState",stateIn]);
  	callback(response,stateIn);
  });
}

function writeState(stateIn,valueIn){
	requestString=("writestate \""+ stateIn + "\" \"" + valueIn + "\"");
	console.log(requestString);
	sendToSCLI(requestString);
return
}


function sendToSCLI (consoleString,callback){
	var a = new eventAnalytics.event();
	fullcommand = sclibridgePath +" "+ consoleString
	console.log("Running:  "+ fullcommand);

	var child = require('child_process');
	var ps = child.exec(fullcommand, (error, stdout, stderr) =>{
		console.log('SCLI Response: '+ stdout);
		if (error){
			console.log('error: '+ error);
			console.log('error.code: '+ error.code);
			console.log('error.signal: '+ error.signal);
			console.log('stderr: '+stderr);
		}
		if (typeof callback !== 'undefined'){
			a.sendTime(["sendToSCLI",consoleString.substr(0,consoleString.indexOf(' '))]);
			callback (stdout);
		};
	});
return
}


module.exports = {
serviceRequest: serviceRequest,
readState: readState,
readMultipleState: readMultipleState,
writeState: writeState
}
