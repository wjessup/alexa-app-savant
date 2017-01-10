const
  savantLib = require('../lib/savantLib'),
  didYouMean = require('didyoumean'),
  action = require('../lib/actionLib'),
  q = require('q');

var serviceObj = [];

function serviceMatcher(cleanZones,serviceIn){
  var defer = q.defer();
  var ret = {}
  systemServices =  appDictionaryZoneServices;
  for (var key in cleanZones[0]){ //do each zone
    console.log("starting loop for "+cleanZones[0][key]);
    var zoneServiceAlias = []
    var zoneServiceProfileName = []
    var cleanZone = cleanZones[0][key];
    for (var key in systemServices[cleanZone]){
       zoneServiceAlias.push(systemServices[cleanZone][key][6]);
       zoneServiceProfileName.push(systemServices[cleanZone][key][1]);
    }

    //validate service name against request.  First check if service alias matchs request
    var ServiceName = didYouMean(serviceIn, zoneServiceAlias);
    //console.log("ServiceName: "+ServiceName);
    //console.log('Looking for: '+req.slot('SERVICE'));
    //console.log('Looking in zoneServiceAlias: '+zoneServiceAlias);

    //get service array if we found a match
    if (ServiceName !== 'null'){
      //match requested service to service list
      //console.log(systemServices[cleanZone]);
      //console.log("ServiceName: "+ServiceName);
      var ServiceArray = systemServices[cleanZone].filter(function (el) {
        return (el[6] === ServiceName);
      })[0];
    }

    // if we have not yet found a match look in profile names
    if (typeof ServiceArray == 'undefined') {
      //console.log('Looking in zoneServiceProfileName: '+zoneServiceProfileName);
      var ServiceName = didYouMean(serviceIn, zoneServiceProfileName);
      //console.log("ServiceName: "+ServiceName);

      var ServiceArray = systemServices[cleanZone].filter(function (el) {
        return (el[1] === ServiceName);
      })[0];
    } else if (ServiceName == 'null') {
      //we did not find a match in alias or profile names
      var err = 'I didnt understand what service you wanted, please try again.';
      defer.reject(err);
      return defer.promise;
    }

    //console.log(ServiceArray);
    if (typeof ServiceArray == 'undefined'){
      var err = 'I didnt understand what service you wanted, please try again.';
      defer.reject(err);
      return defer.promise;
    }
    if (ServiceArray != ""){
      serviceObj[key] = ServiceArray;
    }

  }
  //defer.resolve ([ret,cleanZones]);
  //return defer.promise;

  var ret = [serviceObj,cleanZones]
  console.log("[serviceObj,cleanZones]: "+ret)
  defer.resolve(ret);
  return ret
}

function activeServiceNameMatcher(request){
  var defer = q.defer();
  var serviceName = didYouMean(request,appDictionaryServiceNameArray);
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
      defer.reject(err);
    }

    if (typeof(serviceArray[0]) === 'undefined'){//check if we matched the request to a active service
      var err = serviceName +' is not active anywhere';
      defer.reject(err);
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
return defer.promise;
}
module.exports = {
  serviceMatcher:serviceMatcher,
  activeServiceNameMatcher:activeServiceNameMatcher
}
