const
  savantLib = require('../lib/savantLib'),
  _ = require('lodash'),
  q = require('q');


function powerOffAV(cleanZones){
  //Turn off all zones in cleanZones
  for (var key in cleanZones){
    console.log("sending service request: "+cleanZones[key]);
    savantLib.serviceRequest([cleanZones[key],"PowerOff"],"zone");
  }
}

function setLighting(cleanZones,value){
  var defer = q.defer();
  switch (typeof(value)){
    case "number":
      if (value> 0 ||value<101){
        for (var key in cleanZones[0]){
          console.log("sending service request: "+cleanZones[0][key]);
          savantLib.serviceRequest([cleanZones[0][key]],"lighting","",[value]);
        }
      }else {
        var err = 'I didnt understand please try again. Say High,Medium,or Low';
        defer.reject(err);
        return defer.promise
      }
      break;
    case "string":
      for (var key in cleanZones[0]){
        switch (_.toLower(value)){
          case "high":
            savantLib.serviceRequest([cleanZones[0][key]],"lighting","",[100]);
            break;
          case "hi":
            savantLib.serviceRequest([cleanZones[0][key]],"lighting","",[100]);
            break;
          case "medium":
            savantLib.serviceRequest([cleanZones[0][key]],"lighting","",[50]);
            break;
          case "low":
            savantLib.serviceRequest([cleanZones[0][key]],"lighting","",[25]);
            break;
          default:
            var err = 'I didnt understand please try again. Say High,Medium,or Low';
            defer.reject(err);
            return defer.promise
            break;
        }
      }
      break;
    default:
      var err = 'I didnt understand please try again';
      defer.reject(err);
      return defer.promise
      break;
  }
  defer.resolve();
  return defer.promise
}

function setVolume(cleanZones,value){
  var defer = q.defer();
      console.log ("value type: "+typeof(value));
  switch (typeof(value)){
    case "number":
      if (value> 0 && value<101 && typeof(value) === "number"){
        console.log("Raw Volume request: "+value)
        var volumeValue = Math.round(value/2);
      }else {
        var err = 'I didnt understand please try again. Say a number between 1 and 100';
        defer.reject(err);
        return defer.promise
      }
      for (var key in cleanZones[0]){
        console.log("sending service request: "+cleanZones[0][key]);
        savantLib.serviceRequest([cleanZones[key]],"volume","",[volumeValue]);
      }
      break;
    case "string":
      for (var key in cleanZones[0]){
        switch (_.toLower(value)){
          case "high":
            savantLib.serviceRequest([cleanZones[0][key]],"volume","",[34]);
            break;
          case "hi":
            savantLib.serviceRequest([cleanZones[0][key]],"volume","",[34]);
            break;
          case "medium":
            savantLib.serviceRequest([cleanZones[0][key]],"volume","",[25]);
            break;
          case "low":
            savantLib.serviceRequest([cleanZones[0][key]],"volume","",[15]);
            break;
          default:
            var err = 'I didnt understand please try again. Say High,Medium,or Low';
            defer.reject(err);
            return defer.promise
            break;
        }
      }
      break;
    default:
      var err = 'I didnt understand please try again';
        defer.reject(err);
        return defer.promise
      break;
  }
  defer.resolve(cleanZones);
  return defer.promise
}

function relativeVolume(cleanZones,value){
  var defer = q.defer();
  for (var key in cleanZones[0]){
    savantLib.readState(cleanZones[0][key]+'.CurrentVolume', function(currentVolume,stateIn) {
      var originalZone = stateIn.split(".");//parse original zone
      var newVolume = Number(currentVolume)+value;//adjust volume
      savantLib.serviceRequest([originalZone[0]],"volume","",[newVolume]);//set volume
    });
  }
  defer.resolve();
  return defer.promise
}

function lastPowerOn(cleanZones){
  for (var key in cleanZones[0]){
    savantLib.readState(cleanZones[0][key]+".LastActiveService", function(LastActiveService) {
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

function bulkPowerOn(servicesArray){
  var defer = q.defer();
  for (var key in servicesArray){
    //turn on zone
    savantLib.serviceRequest([servicesArray[key][0],servicesArray[key][1],servicesArray[key][2],servicesArray[key][3],servicesArray[key][4],"PowerOn"],"full");
    savantLib.serviceRequest([servicesArray[key][0],servicesArray[key][1],servicesArray[key][2],servicesArray[key][3],servicesArray[key][4],"Play"],"full");
  }
  return defer.promise
}

function sleepTimer(cleanZones,value,action){
  var defer = q.defer();
  if (action === "arm" || action === "increment"){
    value = Number(value);
    if (value< 0 && value>121){
      var err = 'I didnt understand please try again. Please provde a value between 1 and 120';
      defer.reject(err);
      return defer.promise
    }
  }
  switch (action){
    case "arm":
      for (var key in cleanZones[0]){
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepArm","zone",cleanZones[0][key],"minutes",value],"full");
      }
    break;
    case "disarm":
      for (var key in cleanZones[0]){
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepDisarm","zone",cleanZones[0][key]],"full");
      }
    break;
    case "increment":
      for (var key in cleanZones[0]){
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepIncrement","zone",cleanZones[0][key],"minutes",value],"full");
      }
    break;
  }
  defer.resolve(cleanZones);
  return defer.promise
}

function serviceCommand(cleanZones,value,action){ //value is serviceRequest to send, must match savant
  var defer = q.defer();
  switch (action){
    case "allzones"://Send command to all zones in cleanZones, typically not wanted
      for (var key in cleanZones[0]){
        console.log("sending service request: "+cleanZones[key]);
        savantLib.serviceRequest([cleanZones[0][key],value],"zone");
      }
      break;
    default://Send command to only first zone in cleanZones, stopping any duplicate actions
      console.log("sending service request: "+cleanZones[key]);
      savantLib.serviceRequest([cleanZones[0][0],value],"zone");
      break;
  }
  defer.resolve(cleanZones);
  return defer.promise
}

function muteCommand(cleanZones,action){
  var defer = q.defer();
  switch (action){
    case "on"://Send mute command to all zones in cleanZones
      for (var key in cleanZones[0]){
        console.log("sending service request: "+cleanZones[key]);
        savantLib.serviceRequest([cleanZones[0][key],"MuteOn"],"zone");
      }
      break;
    case "off"://Send unmute command to all zones in cleanZones
      for (var key in cleanZones[0]){
        console.log("sending service request: "+cleanZones[key]);
        savantLib.serviceRequest([cleanZones[0][key],"MuteOff"],"zone");
      }
      break;
  }
  defer.resolve(cleanZones);
  return defer.promise
}


module.exports = {
powerOffAV: powerOffAV,
setLighting: setLighting,
setVolume: setVolume,
relativeVolume: relativeVolume,
lastPowerOn: lastPowerOn,
bulkPowerOn: bulkPowerOn,
sleepTimer: sleepTimer,
serviceCommand: serviceCommand,
muteCommand: muteCommand
}
