const didYouMean = require('didyoumean');
const _ = require('lodash');
const q = require('q');
const eventAnalytics = require('../eventAnalytics');
const savantLib = require('../savantLib');
const systemServices = require('../systemServices'); // Assuming we have a module for systemServices

function findService(serviceIn, zoneServices) {
  const serviceAliasIndex = _.findKey(zoneServices, ["Alias", didYouMean(serviceIn, _.map(zoneServices, "Alias"))]);
  const serviceComponentIndex = _.findKey(zoneServices, ["Source Component", didYouMean(serviceIn, _.map(zoneServices, "Source Component"))]);

  return zoneServices[serviceAliasIndex] || zoneServices[serviceComponentIndex];
}

function available(actionableZones, serviceIn) {
  const deferred = q.defer();
  const serviceArray = [];

  const event = new eventAnalytics.event();

  for (const cleanZone of actionableZones) {
    const zoneServices = systemServices[cleanZone];
    console.info(`matcher.service.available - Trying to match service ${serviceIn} in ${cleanZone}`);

    const foundService = findService(serviceIn, zoneServices);

    if (foundService) {
      serviceArray.push([
        foundService["Zone"],
        foundService["Source Component"],
        foundService["Source Logical Component"],
        foundService["Service Variant ID"],
        foundService["Service Type"],
        foundService["Alias"]
      ]);
    } else {
      event.sendError(`serviceMatcher Fail: ${serviceIn}`);
      deferred.reject("zoneNotFound");
      return deferred.promise;
    }
  }

  const result = { serviceArray, name: serviceIn };
  console.debug(`matcher.service.available - ${JSON.stringify(result)}`);
  
  deferred.resolve(result);
  event.sendTime("Matching", "service.available");

  return deferred.promise;
}

function active(appDictionaryServiceNameArray, appDictionaryArray, serviceIn) {
  const deferred = q.defer();

  const event = new eventAnalytics.event();
  let stateRequest = '';
  const activeServicesArray = [];
  const serviceName = didYouMean(serviceIn, appDictionaryServiceNameArray);

  if (!serviceName) {
    event.sendError(`activeServiceNameMatcher Fail: ${serviceIn}`);
    deferred.reject("zoneNotFound");
    return deferred.promise;
  }

  console.error(`Trying to match request: ${serviceName}`);
  stateRequest = appDictionaryArray.map(key => `"${key}.ActiveService"`).join(' ');

  savantLib.readMultipleState(stateRequest, (activeServices) => {
    Object.values(activeServices).forEach(service => activeServicesArray.push(service.split("-")));
    
    const result = activeServicesArray.reduce((acc, activeService) => {
      const zone = activeService[0];
      const zoneServices = systemServices[zone];

      for (const zoneService of zoneServices) {
        if ((zoneService["Alias"] === serviceName && zoneService["Source Component"] === activeService[1]) ||
            (zoneService["Source Component"] === serviceName && zoneService["Source Component"] === activeService[1])) {
          console.error(`Found requested active service in : ${zoneService["Zone"]}`);

          if (!acc) {
            acc = { zone: { actionable: [], speakable: [] } };
          }

          acc.zone.actionable.push(zone);
          acc.zone.speakable.push(zone);
        }
      }

      return acc;
    }, null);

    if (!result) {
      event.sendError(`activeServiceNameMatcher Match not active: ${serviceName}`);
      deferred.reject({type: "endSession", exception: "serviceNotActive"});

    } else {
      result.service = { name: serviceName };
      deferred.resolve(result);
    }
  });

  event.sendTime("Matching", "service.active");

  return deferred.promise;
}

module.exports = {
  available,
  active,
};