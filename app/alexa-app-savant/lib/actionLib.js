const
  savantLib = require('./savantLib'),
  commandLib = require('./commandLib.json'),
  _ = require('lodash'),
  q = require('q');


function powerOffAV(actionableZones){
  var defer = q.defer();
  //Turn off all zones in actionableZones
  for (var key in actionableZones){
    log.error("action.powerOffAV - "+actionableZones[key]);
    savantLib.serviceRequest([actionableZones[key],"PowerOff"],"zone");
  }
  defer.resolve();
  return defer.promise
}

function setLighting(actionableZones,value,action){
  var defer = q.defer();
  switch (action){
    case "percent":
    value = Number(value);
      if ((value< 0 || value>101) || isNaN(value)){
        var err = 'I didnt understand please try again. say a number between 1 and 100';
        defer.reject(err);
      } else {
        for (var key in actionableZones){
          log.error("action.setLighting - "+actionableZones[key]);
          savantLib.serviceRequest([actionableZones[key]],"lighting","",[value]);
          defer.resolve();
        }
      }
      break;
    case "range":
      for (var key in actionableZones){
        var requestedZone = actionableZones[key];
        switch (_.toLower(value)){
          case "high":
          //  savantLib.serviceRequest([actionableZones[key]],"lighting","",[100]);
            savantLib.serviceRequest([actionableZones[key]],"lighting","",[userPresets.lighting[requestedZone]["high"]]);
            log.error("action.setLighting - "+actionableZones[key]);
            defer.resolve();
            break;
          case "hi":
          //  savantLib.serviceRequest([actionableZones[key]],"lighting","",[100]);
            savantLib.serviceRequest([actionableZones[key]],"lighting","",[userPresets.lighting[requestedZone]["high"]]);
            log.error("action.setLighting - "+actionableZones[key]);
            defer.resolve();
            break;
          case "medium":
          //  savantLib.serviceRequest([actionableZones[key]],"lighting","",[100]);
            savantLib.serviceRequest([actionableZones[key]],"lighting","",[userPresets.lighting[requestedZone]["medium"]]);
            log.error("action.setLighting - "+actionableZones[key]);
            defer.resolve();
            break;
          case "low":
            //savantLib.serviceRequest([actionableZones[key]],"lighting","",[100]);
            savantLib.serviceRequest([actionableZones[key]],"lighting","",[userPresets.lighting[requestedZone]["low"]]);
            log.error("action.setLighting - "+actionableZones[key]);
            defer.resolve();
            break;
            case "on":
              //savantLib.serviceRequest([actionableZones[key]],"lighting","",[100]);
              savantLib.serviceRequest([actionableZones[key]],"lighting","",[userPresets.lighting[requestedZone]["on"]]);
              log.error("action.setLighting - "+actionableZones[key]);
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

function setVolume(actionableZones,value,action){
  var defer = q.defer();
  switch (action){
    case "percent":
      value = Number(value);
      if ((value< 0 || value>101) || isNaN(value)){
        var err = 'I didnt understand please try again. say a number between 1 and 100';
        defer.reject(err);
      }else {
        log.error("Raw Volume request: "+value)
        var volumeValue = Math.round(value/2);
        for (var key in actionableZones){
          log.error("action.setVolume - "+actionableZones[key]);
          savantLib.serviceRequest([actionableZones[key]],"volume","",[volumeValue]);
        }
        defer.resolve();
      }
      break;
    case "range":
      for (var key in actionableZones){
        var requestedZone = actionableZones[key];
        switch (_.toLower(value)){
          case "high":
            savantLib.serviceRequest([actionableZones[key]],"volume","",[userPresets.volume[requestedZone]["high"]]);
            log.error("action.setVolume - "+actionableZones[key]);
            defer.resolve();
            break;
          case "hi":
            savantLib.serviceRequest([actionableZones[key]],"volume","",[userPresets.volume[requestedZone]["high"]]);
            log.error("action.setVolume - "+actionableZones[key]);
            defer.resolve();
            break;
          case "medium":
            savantLib.serviceRequest([actionableZones[key]],"volume","",[userPresets.volume[requestedZone]["medium"]]);
            log.error("action.setVolume - "+actionableZones[key]);
            defer.resolve();
            break;
          case "low":
            savantLib.serviceRequest([actionableZones[key]],"volume","",[userPresets.volume[requestedZone]["low"]]);
            log.error("action.setVolume - "+actionableZones[key]);
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

function relativeVolume(actionableZones,value,steps){
  var defer = q.defer();
  _.forEach(actionableZones, function(zone){
    savantLib.readMultipleStateQ(zone+'.RelativeVolumeOnly" "'+zone+'.CurrentVolume')
    .then(function (response){
      if (response[0] === '0'){
        var newVolume = Number(response[1])+value
        savantLib.serviceRequest([zone],'volume','',[newVolume]);
        log.error('setting two way volume in '+zone )
        a.sendAV([cleanZones,'Zone','Adjust Volume',{'value':'Two Way, '+value,'type':'adjust'}]);
      }else{
        if (value > 0) {
          var action = "VolumeUp"
        }else{
          var action = "VolumeDown"
        }
        _.times(steps, function() {
           savantLib.serviceRequest([zone,action],'zone');
        },zone,action);
        log.error('setting one way Volume in '+zone )
        a.sendAV([cleanZones,'Zone','Adjust Volume',{'value':'One Way, '+action,'type':'adjust'}]);
      }
    })
  },value);
  defer.resolve();
  return defer.promise
}

function readStateLastPower(path) {
  var defer = q.defer();
  savantLib.readState(path, function(LastActiveService) {
    log.error('actionLib.readStateLastPower - LastActiveService: "'+LastActiveService+'"')
    if (!LastActiveService || LastActiveService.length === 0){
      defer.reject({type: "endSession", exception: "noLastService"});
    }else{
      var cleanZoneArray = LastActiveService.split("-");
      log.error("actionLib.readStateLastPower - last service:  " +LastActiveService);
      savantLib.serviceRequest([cleanZoneArray[0],cleanZoneArray[1],cleanZoneArray[2],cleanZoneArray[3],cleanZoneArray[4],"PowerOn"],"full");
      var sourceComponent = cleanZoneArray[1]
      if (userPresets.sourceComponent[sourceComponent]["playWithPower"]) {
        log.error("actionLib.readStateLastPower - Sending Play command for "+sourceComponent)
        savantLib.serviceRequest([cleanZoneArray[0],cleanZoneArray[1],cleanZoneArray[2],cleanZoneArray[3],cleanZoneArray[4],"Play"],"full");
      }else {
        log.error("actionLib.readStateLastPower - Skipping Play command for "+sourceComponent)
      }
    }
      defer.resolve();
  });
  return defer.promise;
}

function lastPowerOn(actionableZones){
  var prom = q();
  for (var key in actionableZones) {
    prom = prom.then(function() {
      return readStateLastPower(actionableZones[key]+".LastActiveService");
    })
  }
  return prom
}

function bulkPowerOn(servicesArray){
  var defer = q.defer();
  for (var key in servicesArray){
    //turn on zone
    log.error("action.bulkPowerOn - "+servicesArray[key][0]);
    savantLib.serviceRequest([servicesArray[key][0],servicesArray[key][1],servicesArray[key][2],servicesArray[key][3],servicesArray[key][4],"PowerOn"],"full");
    return savantLib.readStateQ(servicesArray[key][0]+".ActiveService")
    .then(function (currentValue){
      currentValue = currentValue.split("-");
      var sourceComponent = currentValue[1]
      if (userPresets.sourceComponent[sourceComponent]["playWithPower"]) {
        log.error("actionLib.bulkPowerOn - Sending Play command for "+sourceComponent)
        savantLib.serviceRequest([servicesArray[key][0],servicesArray[key][1],servicesArray[key][2],servicesArray[key][3],servicesArray[key][4],"Play"],"full");
      }else{
        log.error("actionLib.bulkPowerOn - Skipping Play command for "+sourceComponent)
      }

    })

  }
  defer.resolve();
  return defer.promise
}

function sleepTimer(actionableZones,value,action){
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
      for (var key in actionableZones){
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepArm","zone",actionableZones[key],"minutes",value],"full");
        log.error("action.sleepTimer - "+customWorkflowScope[0]);
      }
      defer.resolve(actionableZones);
    break;
    case "disarm":
      for (var key in actionableZones){
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepDisarm","zone",actionableZones[key]],"full");
        log.error("action.sleepTimer - "+customWorkflowScope[0]);
      }
      defer.resolve(actionableZones);
    break;
    case "increment":
      for (var key in actionableZones){
        savantLib.serviceRequest([customWorkflowScope[0],customWorkflowScope[1],"","1","SVC_GEN_GENERIC","dis_sleepIncrement","zone",actionableZones[key],"minutes",value],"full");
        log.error("action.sleepTimer - "+customWorkflowScope[0]);
      }
      defer.resolve(actionableZones);
    break;
  }
  return defer.promise
}

function serviceCommand(actionableZones,value,action){ //value is serviceRequest to send, must match savant
  var defer = q.defer();
  switch (action){
    case "commandMatcher"://accepts actionableZones as single zone string not array
      savantLib.serviceRequest([actionableZones,value],"zone");
      log.error("action.serviceCommand - "+actionableZones[key]);
      break;
    case "allzones"://Send command to all zones in actionableZones, typically not wanted
      for (var key in actionableZones){
        savantLib.serviceRequest([actionableZones[key],value],"zone");
        log.error("action.serviceCommand - "+actionableZones[key]);
      }
      break;
    default://Send command to only first zone in actionableZones, stopping any duplicate actions
      savantLib.serviceRequest([actionableZones[0],value],"zone");
      log.error("action.serviceCommand - "+actionableZones);
      break;
  }
  defer.resolve(actionableZones);
  return defer.promise
}

function muteCommand(actionableZones,action){
  var defer = q.defer();
  switch (action){
    case "on"://Send mute command to all zones in actionableZones
      for (var key in actionableZones){
        savantLib.serviceRequest([actionableZones[key],"MuteOn"],"zone");
        log.error("sending service request: "+actionableZones[key]);
      }
      break;
    case "off"://Send unmute command to all zones in actionableZones
      for (var key in actionableZones){
        savantLib.serviceRequest([actionableZones[key],"MuteOff"],"zone");
        log.error("sending service request: "+actionableZones[key]);
      }
      break;
  }
  defer.resolve(actionableZones);
  return defer.promise
}

function channelTune(actionableZones,channel){
  var defer = q.defer();
  log.error("actionLib.channelTune - tune to :"+channel.number)
  for (var key of channel.number){
    serviceCommand(actionableZones,commandLib.numbers[key])
    sleep(500);
  }
  serviceCommand(actionableZones,"enter")

  defer.resolve(channel.name);
  return defer.promise
}



function sleep(dur) {
 var d = new Date().getTime() + dur;
  while(new Date().getTime() <= d ) {
    //Do nothing
  }

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
muteCommand: muteCommand,
channelTune:channelTune
}
