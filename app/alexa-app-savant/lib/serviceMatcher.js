const
 didYouMean = require('didyoumean'),
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

module.exports = {
  serviceMatcher:serviceMatcher
}
