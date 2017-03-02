const
  savantLib = require('../savantLib'),
  didYouMean = require('didyoumean'),
  action = require('../actionLib'),
  eventAnalytics = require('../eventAnalytics'),
  _ = require('lodash'),
  q = require('q');

function avaiable(actionableZones,serviceIn){
  var a = new eventAnalytics.event();
  var defer = q.defer();
  var serviceArray = [];
  for (var key in actionableZones){ //do each zone
    var cleanZone = actionableZones[key];
    var zoneServices = systemServices[cleanZone];
    log.info("matcher.service.avaiable - Trying to match service "+serviceIn+" in "+cleanZone);
    //get index of service array for matched service
    //map(create array of all zone alises), Didyoumean(compare request against array),  findkey(match request to zone returning an index if matched)
    var foundServiceAliasIndex = _.findKey(zoneServices, ["Alias", didYouMean(serviceIn, _.map(zoneServices, "Alias"))]);
    var foundServiceComponentIndex = _.findKey(zoneServices, ["Source Component", didYouMean(serviceIn, _.map(zoneServices, "Source Component"))]);
    // get service array if an index was found
    if (foundServiceAliasIndex){ var foundService = zoneServices[foundServiceAliasIndex] }
    if (foundServiceComponentIndex){ var foundService = zoneServices[foundServiceComponentIndex] }
    //if we found a service save array into serviceArray
    if (foundService){
      serviceArray.push([foundService["Zone"],foundService["Source Component"],foundService["Source Logical Component"],foundService["Service Variant ID"],foundService["Service Type"],foundService["Alias"]]);
    } else {
      a.sendError("serviceMatcher Fail: "+serviceIn);
      defer.reject("zoneNotFound");
      return defer.promise;
    }
  }
  var ret = {"serviceArray":serviceArray,"name":serviceIn}
  log.debug("matcher.service.avaiable - "+ JSON.stringify(ret));
  defer.resolve(ret);
  a.sendTime("Matching","service.available");
  return defer.promise
}

function active(serviceIn){
  var a = new eventAnalytics.event();
  var defer = q.defer();
  var stateRequest = '';
  var activeServicesArray = [];


  var serviceName = didYouMean(serviceIn,appDictionaryServiceNameArray);
  if (serviceName === null) {//we did not find a match in alias or profile names
    a.sendError("activeServiceNameMatcher Fail: "+serviceIn);
    defer.reject("zoneNotFound");
    return defer.promise;
  }

  log.error('Trying to match request: '+serviceName);
  for (var key in appDictionaryArray){//build ActiveService states
    stateRequest = stateRequest.concat('"'+appDictionaryArray[key]+'.ActiveService'+'" ')
  }
  stateRequest = stateRequest.substring(1);
  stateRequest = stateRequest.substring(0,stateRequest.length-2);

  savantLib.readMultipleState(stateRequest, function (activeServices,stateIn){//get ActiveServies
    //log.error('activeServices: '+activeServices);
    for (var key in activeServices){//break services into array
      activeServicesArray.push(activeServices[key].split("-"));
    }
    for (var key in activeServicesArray){
      var zone = activeServicesArray[key][0];
      var zoneServices = systemServices[zone];
      for (var key2 in zoneServices){
        //log.error("zoneServices[key2][Alias]: "+zoneServices[key2]["Alias"])
        //log.error("zoneServices[key2][Source Component]: "+zoneServices[key2]["Source Component"])
        //log.error("serviceName: "+serviceName);
        if (
          (zoneServices[key2]["Alias"] === serviceName && zoneServices[key2]["Source Component"] === activeServicesArray[key][1]) ||
          (zoneServices[key2]["Source Component"] === serviceName && zoneServices[key2]["Source Component"] === activeServicesArray[key][1])
        ){
          log.error('Found requested active service in : '+zoneServices[key2]["Zone"]);
          if (!ret){
            var ret = {};
            ret.zone = {};
            ret.zone.actionable = [];
            ret.zone.speakable = [];
          }
          ret.zone.actionable.push(zone);
          ret.zone.speakable.push(zone);
        }
      }
    }
    if (!ret){//we did not match an active service
      a.sendError(["activeServiceNameMatcher Match not active: "+serviceName]);
      defer.reject({type: "endSession", exception: "serviceNotActive"});
      return defer.promise;
    }else{// we matched an active service, return
      ret.service = {};
      ret.service.name = serviceName;
      defer.resolve(ret);
    }
  });
  a.sendTime("Matching","service.active");
  return defer.promise;
}
module.exports = {
  avaiable:avaiable,
  active:active
}
