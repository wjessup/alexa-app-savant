const
  savantLib = require('../lib/savantLib'),
  didYouMean = require('didyoumean'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('./eventAnalytics'),
  q = require('q');



function serviceMatcher(cleanZones,serviceIn){
  var a = new eventAnalytics.event();
  var defer = q.defer();
  var ret = {}
  var serviceObj = [];
  systemServices =  appDictionaryZoneServices;
  for (var key in cleanZones[0]){ //do each zone
    console.log("Trying to match service "+serviceIn+" in "+cleanZones[0][key]);
    var zoneServiceAlias = []
    var zoneServiceProfileName = []
    var cleanZone = cleanZones[0][key];

    for (var key2 in systemServices[cleanZone]){
      zoneServiceAlias.push(systemServices[cleanZone][key2][6]);
      zoneServiceProfileName.push(systemServices[cleanZone][key2][1]);
    }
    //console.log('Looking for: '+serviceIn+' in zoneServiceAlias: '+zoneServiceAlias);
    var ServiceName = didYouMean(serviceIn, zoneServiceAlias);//validate request against service alias.
    if (ServiceName != null) {
      //console.log("zoneServiceAlias ServiceName: "+ServiceName);
      var ServiceArray = systemServices[cleanZone].filter(function (el) {//match requested service to ServiceAlias list
        return (el[6] === ServiceName);
      })[0];
    } else{// no match, look in profile names
      //console.log('Could not match to a service alias looking for: '+serviceIn+' in zoneServiceProfileName: '+zoneServiceProfileName);
      var ServiceName = didYouMean(serviceIn, zoneServiceProfileName);
      if (ServiceName != null) {
        //console.log("zoneServiceProfileName ServiceName: "+ServiceName);
        var ServiceArray = systemServices[cleanZone].filter(function (el) {//match requested service to profileName list
          return (el[1] === ServiceName);
        })[0];
      }
    }
    //console.log(ServiceArray);
    if (typeof ServiceArray === 'undefined') {//we did not find a match in alias or profile names
      a.sendError("serviceMatcher Fail: "+serviceIn);
      defer.reject('I didnt understand what service you wanted, please try again.');
      return defer.promise;
    }
    if (ServiceArray != ""){
      serviceObj.push(ServiceArray);
    }
  }
  var ret = [serviceObj,cleanZones]
  //console.log("serviceObj: "+ret[0])
  //console.log("cleanZones: "+ret[1])
  defer.resolve(ret);
  a.sendTime(["Matching","serviceMatcher"]);
  return ret
}

function activeServiceNameMatcher(serviceIn){
  var a = new eventAnalytics.event();
  var defer = q.defer();
  var serviceName = didYouMean(serviceIn,appDictionaryServiceNameArray);
  var zoneStates = [];
  var request = '';
  var activeServicesArray = [];
  console.log('Trying to match request: '+serviceName);
  for (var key in appDictionaryArray){
    request = request.concat('"'+appDictionaryArray[key]+'.ActiveService'+'" ')
  }
  request = request.substring(1);
  request = request.substring(0,request.length-2);
  savantLib.readMultipleState(request, function (activeServices,stateIn){
    //console.log('activeServices: '+activeServices);
    for (var key in activeServices){//break services into array
      activeServicesArray.push(activeServices[key].split("-"));
    }
    var serviceArray = activeServicesArray.filter(function (el) {//compare requested service with active service names, return service array
      return (el[6] === serviceName);
    });
    if (typeof ServiceArray == 'undefined') {// if we have not yet found a match look in profile names,return service array
      var serviceArray = activeServicesArray.filter(function (el) {
        return (el[1] === serviceName);
      });
    }

    if (typeof(serviceName) === 'object') {
      //we did not find a match in alias or profile names
      var err = 'I didnt understand what service you wanted, please try again.';
      a.sendError("activeServiceNameMatcher Fail: "+serviceIn);
      defer.reject(err);
      return defer.promise;
    }

    if (typeof(serviceArray[0]) === 'undefined'){//check if we matched the request to a active service
      var err = serviceName +' is not active anywhere';
      a.sendError(["activeServiceNameMatcher Match not active: "+serviceName]);
      defer.reject(err);
      return defer.promise;
    }else{
      var cleanZones= [[],[]];
      for (var key in serviceArray){
        console.log('Found service in : '+serviceArray[key][0]);
        cleanZones[0].push(serviceArray[key][0]);
        cleanZones[1].push(serviceArray[key][0]);
      }
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
