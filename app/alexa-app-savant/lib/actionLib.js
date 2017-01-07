var savantLib = require('../lib/savantLib');
var _ = require('lodash');


function powerOffAV(cleanZones){
  //Turn off all zones in cleanZones
  for (var key in cleanZones){
    console.log("sending service request: "+cleanZones[key]);
    savantLib.serviceRequest([cleanZones[key],"PowerOff"],"zone");
  }
}

function setLighting(cleanZones,value,callback){
  //Turn off all zones in cleanZones
  if (typeof(value) === "number"){
    for (var key in cleanZones){
      console.log("sending service request: "+cleanZones[key]);
      savantLib.serviceRequest([cleanZones[key]],"lighting","",[value]);
    }
  }
  if (typeof(value) === "string"){
    for (var key in cleanZones){
      switch (_.toLower(value)){
        case "high":
          savantLib.serviceRequest([cleanZones[key]],"lighting","",[100]);
          break;
        case "hi":
          savantLib.serviceRequest([cleanZones[key]],"lighting","",[100]);
          break;
        case "medium":
          savantLib.serviceRequest([cleanZones[key]],"lighting","",[50]);
          break;
        case "low":
          savantLib.serviceRequest([cleanZones[key]],"lighting","",[25]);
          break;
        default:
          var err = 'I didnt understand please try again. Say High,Medium,or Low';
          callback(err);
          break;
      }
    }
  }
}

function setVolume(cleanZones,value,callback){
  //Turn off all zones in cleanZones
  if (typeof(value) === "number"){
    for (var key in cleanZones){
      console.log("sending service request: "+cleanZones[key]);
      savantLib.serviceRequest([cleanZones[key]],"volume","",[value]);
    }
  }
  if (typeof(value) === "string"){
    for (var key in cleanZones){
      switch (_.toLower(value)){
        case "high":
          savantLib.serviceRequest([cleanZones[key]],"volume","",[34]);
          break;
        case "hi":
          savantLib.serviceRequest([cleanZones[key]],"volume","",[34]);
          break;
        case "medium":
          savantLib.serviceRequest([cleanZones[key]],"volume","",[25]);
          break;
        case "low":
          savantLib.serviceRequest([cleanZones[key]],"volume","",[15]);
          break;
        default:
          var err = 'I didnt understand please try again. Say High,Medium,or Low';
          callback(err);
          break;
      }
    }
  }
}

function relativeVolume(cleanZones,value){
  for (var key in cleanZones){
    savantLib.readState(cleanZones[key]+'.CurrentVolume', function(currentVolume,stateIn) {
      //parse original zone
      var originalZone = stateIn.split(".");
      //adjust volume
      var newVolume = Number(currentVolume)+value
      //set volume
      savantLib.serviceRequest([originalZone[0]],"volume","",[newVolume]);
    });
  }
}

function lastPowerOn(cleanZones){
  for (var key in cleanZones){
    savantLib.readState(cleanZones[key]+".LastActiveService", function(LastActiveService) {
      console.log("LastActiveService: "+LastActiveService)
      if (typeof LastActiveService == 'undefined' || LastActiveService == ''){
        var err = 'No previous service. Please say which service to turn on';
        callback(err);
      }
      var cleanZoneArray = LastActiveService.split("-");
      //console.log("last service:  " +LastActiveService);

      //turn on zone
      savantLib.serviceRequest([cleanZoneArray[0],cleanZoneArray[1],cleanZoneArray[2],cleanZoneArray[3],cleanZoneArray[4],"PowerOn"],"full");
      savantLib.serviceRequest([cleanZoneArray[0],cleanZoneArray[1],cleanZoneArray[2],cleanZoneArray[3],cleanZoneArray[4],"Play"],"full");
    });
  }
}

function sleepTimer(cleanZones,action,value){
  switch (action){
    case "arm":
      for (var key in cleanZones){
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepArm","zone",cleanZones[0],"minutes",value],"full");
      }
    break;
    case "disarm":
      for (var key in cleanZones){
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepDisarm","zone",cleanZones[0]],"full");
      }
    break;
    case "increment":
      for (var key in cleanZones){
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepIncrement","zone",cleanZones[0],"minutes",value],"full");
      }
    break;
  }
}


module.exports = {
powerOffAV: powerOffAV,
setLighting: setLighting,
setVolume: setVolume,
relativeVolume: relativeVolume,
lastPowerOn: lastPowerOn,
sleepTimer: sleepTimer
}
