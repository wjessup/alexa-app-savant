const
  savantLib = require('../lib/savantLib'),
  didYouMean = require('didyoumean'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('./eventAnalytics'),
  _ = require('lodash'),
  q = require('q');

function serviceMatcher(cleanZones,serviceIn){
  var a = new eventAnalytics.event();
  var defer = q.defer();
  var serviceArray = [];
  for (var key in cleanZones[0]){ //do each zone
    var cleanZone = cleanZones[0][key];
    var zoneServices = systemServices[cleanZone];
    console.log("Trying to match service "+serviceIn+" in "+cleanZone);
    //get index of service array for matched service
    //map(create array of all zone alises), Didyoumean(compare request against array),  findkey(match request to zone returning an index if matched)
    var foundServiceAliasIndex = _.findKey(zoneServices, ["Alias", didYouMean(serviceIn, _.map(zoneServices, "Alias"))]);
    var foundServiceComponentIndex = _.findKey(zoneServices, ["Source Component", didYouMean(serviceIn, _.map(zoneServices, "Source Component"))]);
    // get service array if an index was found
    if (foundServiceAliasIndex){ var foundService = zoneServices[foundServiceAliasIndex] }
    if (foundServiceComponentIndex){ var foundService = zoneServices[foundServiceComponentIndex] }
    //if we found a service save array into serviceObj
    if (foundService){
      serviceArray.push([foundService["Zone"],foundService["Source Component"],foundService["Source Logical Component"],foundService["Service Variant ID"],foundService["Service Type"],foundService["Alias"]]);
    } else {
      a.sendError("serviceMatcher Fail: "+serviceIn);
      defer.reject('I didnt understand what service you wanted, please try again.');
      return defer.promise;
    }
  }
  var ret = {"serviceArray":serviceArray,"cleanZones":cleanZones}
  //console.log("ret.serviceArray: "+ret.serviceArray)
  //console.log("ret.cleanZones: "+ret.cleanZones)
  defer.resolve(ret);
  a.sendTime(["Matching","serviceMatcher"]);
  return defer.promise
}

function activeServiceNameMatcher(serviceIn){
  var a = new eventAnalytics.event();
  var defer = q.defer();
  var stateRequest = '';
  var activeServicesArray = [];

  var serviceName = didYouMean(serviceIn,appDictionaryServiceNameArray);
  if (serviceName === null) {//we did not find a match in alias or profile names
    a.sendError("activeServiceNameMatcher Fail: "+serviceIn);
    defer.reject('I didnt understand what service you wanted, please try again.');
    return defer.promise;
  }

  console.log('Trying to match request: '+serviceName);
  for (var key in appDictionaryArray){//build ActiveService states
    stateRequest = stateRequest.concat('"'+appDictionaryArray[key]+'.ActiveService'+'" ')
  }
  stateRequest = stateRequest.substring(1);
  stateRequest = stateRequest.substring(0,stateRequest.length-2);

  savantLib.readMultipleState(stateRequest, function (activeServices,stateIn){//get ActiveServies
    //console.log('activeServices: '+activeServices);
    for (var key in activeServices){//break services into array
      activeServicesArray.push(activeServices[key].split("-"));
    }
    var cleanZones= [[],[]];
    for (var key in activeServicesArray){
      var zone = activeServicesArray[key][0];
      var zoneServices = systemServices[zone];
      for (var key2 in zoneServices){
        //console.log("zoneServices[key2][Alias]: "+zoneServices[key2]["Alias"])
        //console.log("zoneServices[key2][Source Component]: "+zoneServices[key2]["Source Component"])
        //console.log("serviceName: "+serviceName);
        if (
          (zoneServices[key2]["Alias"] === serviceName && zoneServices[key2]["Source Component"] === activeServicesArray[key][1]) ||
          (zoneServices[key2]["Source Component"] === serviceName && zoneServices[key2]["Source Component"] === activeServicesArray[key][1])
        ){
          console.log('Found requested active service in : '+zoneServices[key2]["Zone"]);
          cleanZones[0].push(zone);
          cleanZones[1].push(zone);
        }
      }
    }
    if (cleanZones[0] === ''){//we did not match an active service
      a.sendError(["activeServiceNameMatcher Match not active: "+serviceName]);
      defer.reject(serviceName +' is not active anywhere');
      return defer.promise;
    }else{// we matched an active service, return cleanZones
      defer.resolve(cleanZones);
    }
  });
  a.sendTime(["Matching","activeServiceNameMatcher"]);
  return defer.promise;
}
module.exports = {
  serviceMatcher:serviceMatcher,
  activeServiceNameMatcher:activeServiceNameMatcher
}
