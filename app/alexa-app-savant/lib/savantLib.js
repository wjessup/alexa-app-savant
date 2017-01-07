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
    console.log("Looking for state: \""+ stateIn + "\"");
    sendToSCLI("readstate \""+ stateIn + "\"",function(response){
    	console.log("Readstate response: "+response);
			response = response.replace(/(\r\n|\n|\r)/gm,"");
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
	fullcommand = sclibridgePath +" "+ consoleString
	console.log("Running:  "+ fullcommand);

	var child = require('child_process');
	var ps = child.exec(fullcommand, (error, stdout, stderr) =>{
		console.log('SCLI Response: '+ stdout);
		if (typeof callback !== 'undefined'){
			callback (stdout);
		};
	});
return
}


module.exports = {
serviceRequest: serviceRequest,
readState: readState,
writeState: writeState
}
