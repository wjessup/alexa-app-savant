const
  savantLib = require('../lib/savantLib'),
  _ = require('lodash'),
  q = require('q');


function powerOffAV(cleanZones){
  var defer = q.defer();
  //Turn off all zones in cleanZones
  for (var key in cleanZones[0]){
    console.log("sending service request: "+cleanZones[key]);
    savantLib.serviceRequest([cleanZones[0][key],"PowerOff"],"zone");
  }
  defer.resolve();
  return defer.promise
}

function setLighting(cleanZones,value,action){
  var defer = q.defer();
  switch (action){
    case "percent":
    value = Number(value);
      if ((value< 0 || value>101) || isNaN(value)){
        var err = 'I didnt understand please try again. say a number between 1 and 100';
        defer.reject(err);
      } else {
        for (var key in cleanZones[0]){
          console.log("sending service request: "+cleanZones[0][key]);
          savantLib.serviceRequest([cleanZones[0][key]],"lighting","",[value]);
          defer.resolve();
        }
      }
      break;
    case "range":
      for (var key in cleanZones[0]){
        switch (_.toLower(value)){
          case "high":
            savantLib.serviceRequest([cleanZones[0][key]],"lighting","",[100]);
            defer.resolve();
            break;
          case "hi":
            savantLib.serviceRequest([cleanZones[0][key]],"lighting","",[100]);
            defer.resolve();
            break;
          case "medium":
            savantLib.serviceRequest([cleanZones[0][key]],"lighting","",[50]);
            defer.resolve();
            break;
          case "low":
            savantLib.serviceRequest([cleanZones[0][key]],"lighting","",[25]);
            defer.resolve();
            break;
          default:
            var err = 'I didnt understand please try again. Say High,Medium,or Low';
            defer.reject(err);
            break;
        }
      }
      break;
    default:
      var err = 'Please set an action';
      defer.reject(err);
      break;
  }
  return defer.promise
}

function setVolume(cleanZones,value,action){
  var defer = q.defer();
  switch (action){
    case "percent":
      value = Number(value);
      if ((value< 0 || value>101) || isNaN(value)){
        var err = 'I didnt understand please try again. say a number between 1 and 100';
        defer.reject(err);
      }else {
        console.log("Raw Volume request: "+value)
        var volumeValue = Math.round(value/2);
        for (var key in cleanZones[0]){
          console.log("sending service request: "+cleanZones[0][key]);
          savantLib.serviceRequest([cleanZones[key]],"volume","",[volumeValue]);
        }
        defer.resolve();
      }
      break;
    case "range":
      for (var key in cleanZones[0]){
        switch (_.toLower(value)){
          case "high":
            savantLib.serviceRequest([cleanZones[0][key]],"volume","",[34]);
            defer.resolve();
            break;
          case "hi":
            savantLib.serviceRequest([cleanZones[0][key]],"volume","",[34]);
            defer.resolve();
            break;
          case "medium":
            savantLib.serviceRequest([cleanZones[0][key]],"volume","",[25]);
            defer.resolve();
            break;
          case "low":
            savantLib.serviceRequest([cleanZones[0][key]],"volume","",[15]);
            defer.resolve();
            break;
          default:
            var err = 'I didnt understand please try again. Say High,Medium,or Low';
            defer.reject(err);
            break;
        }
      }
      break;
    default:
      var err = 'Please declare an action';
        defer.reject(err);
      break;
  }
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

function readStateLastPower(path) {
  var defer = q.defer();
  savantLib.readState(path, function(LastActiveService) {
    console.log("LastActiveService:"+LastActiveService+"dsfdsf")
    console.log('type: '+typeof(LastActiveService))
    if (!LastActiveService || LastActiveService.length === 0){
      console.log("in the if")
      var err = 'No previous service. Please say which service to turn on';
      defer.reject(err);
    }else{
      var cleanZoneArray = LastActiveService.split("-");
      console.log("last service:  " +LastActiveService);
      //turn on zone
      savantLib.serviceRequest([cleanZoneArray[0],cleanZoneArray[1],cleanZoneArray[2],cleanZoneArray[3],cleanZoneArray[4],"PowerOn"],"full");
      savantLib.serviceRequest([cleanZoneArray[0],cleanZoneArray[1],cleanZoneArray[2],cleanZoneArray[3],cleanZoneArray[4],"Play"],"full");
      defer.resolve();
    }
  });
  return defer.promise;
}

function lastPowerOn(cleanZones){
  var prom = q();
  for (var key in cleanZones[0]) {
    prom = prom.then(function() {
      return readStateLastPower(cleanZones[0][key]+".LastActiveService");
    })
  }
  console.log("past the for")
  return prom
}

function bulkPowerOn(servicesArray){
  var defer = q.defer();
  for (var key in servicesArray){
    //turn on zone
    savantLib.serviceRequest([servicesArray[key][0],servicesArray[key][1],servicesArray[key][2],servicesArray[key][3],servicesArray[key][4],"PowerOn"],"full");
    savantLib.serviceRequest([servicesArray[key][0],servicesArray[key][1],servicesArray[key][2],servicesArray[key][3],servicesArray[key][4],"Play"],"full");
  }
  defer.resolve();
  return defer.promise
}

function sleepTimer(cleanZones,value,action){
  var defer = q.defer();
  if (action === "arm" || action === "increment"){
    value = Number(value);
    if ((value< 0 || value>121) || isNaN(value)){
      var err = 'I didnt understand please try again. say a number between 1 and 120';
      defer.reject(err);
    }
  }
  switch (action){
    case "arm":
      for (var key in cleanZones[0]){
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepArm","zone",cleanZones[0][key],"minutes",value],"full");
      }
      defer.resolve(cleanZones);
    break;
    case "disarm":
      for (var key in cleanZones[0]){
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepDisarm","zone",cleanZones[0][key]],"full");
      }
      defer.resolve(cleanZones);
    break;
    case "increment":
      for (var key in cleanZones[0]){
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepIncrement","zone",cleanZones[0][key],"minutes",value],"full");
      }
      defer.resolve(cleanZones);
    break;
  }
  return defer.promise
}

function serviceCommand(cleanZones,value,action){ //value is serviceRequest to send, must match savant
  var defer = q.defer();
  switch (action){
    case "commandMatcher"://accepts cleanZones as single zone string not array
      console.log("sending service request: "+cleanZones[key]);
      savantLib.serviceRequest([cleanZones,value],"zone");
      break;
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
