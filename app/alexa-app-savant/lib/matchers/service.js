const savantLib = require('../savantLib');
const didYouMean = require('didyoumean');
const action = require('../actionLib');
const eventAnalytics = require('../eventAnalytics');
const _ = require('lodash');
const q = require('q');

function available(actionableZones, serviceIn) {
  const analyticsEvent = new eventAnalytics.event();
  const deferred = q.defer();
  const serviceArray = [];

  for (const key in actionableZones) {
    const cleanZone = actionableZones[key];
    const zoneServices = systemServices[cleanZone];
    log.info(`matcher.service.available - Trying to match service ${serviceIn} in ${cleanZone}`);

    const foundServiceAliasIndex = _.findKey(zoneServices, ["Alias", didYouMean(serviceIn, _.map(zoneServices, "Alias"))]);
    const foundServiceComponentIndex = _.findKey(zoneServices, ["Source Component", didYouMean(serviceIn, _.map(zoneServices, "Source Component"))]);
    let foundService;

    if (foundServiceAliasIndex) {
      foundService = zoneServices[foundServiceAliasIndex];
    }
    if (foundServiceComponentIndex) {
      foundService = zoneServices[foundServiceComponentIndex];
    }

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
        analyticsEvent.sendError(`serviceMatcher Fail: ${serviceIn}`);
        deferred.reject("zoneNotFound");
        return deferred.promise;
    }
  }

  const result = { "serviceArray": serviceArray, "name": serviceIn };
  log.debug(`matcher.service.available - ${JSON.stringify(result)}`);
  deferred.resolve(result);
  analyticsEvent.sendTime("Matching", "service.available");
  return deferred.promise;
}

function active(serviceIn) {
  const analyticsEvent = new eventAnalytics.event();
  const deferred = q.defer();
  let stateRequest = '';
  const activeServicesArray = [];
  const serviceName = didYouMean(serviceIn, appDictionaryServiceNameArray);

  if (!serviceName) {
    analyticsEvent.sendError(`activeServiceNameMatcher Fail: ${serviceIn}`);
    deferred.reject("zoneNotFound");
    return deferred.promise;
  }

  log.error(`Trying to match request: ${serviceName}`);
  
  for (const key in appDictionaryArray) {
    stateRequest = stateRequest.concat(`"${appDictionaryArray[key]}.ActiveService" `);
  }
  
  stateRequest = stateRequest.slice(1, -2);

  savantLib.readMultipleState(stateRequest, (activeServices) => {
    for (const key in activeServices) {
      activeServicesArray.push(activeServices[key].split("-"));
    }

    let result;

    for (const key in activeServicesArray) {
      const zone = activeServicesArray[key][0];
      const zoneServices = systemServices[zone];

      for (const key2 in zoneServices) {
        if ((zoneServices[key2]["Alias"] === serviceName && zoneServices[key2]["Source Component"] === activeServicesArray[key][1]) ||
          (zoneServices[key2]["Source Component"] === serviceName && zoneServices[key2]["Source Component"] === activeServicesArray[key][1])) {

          log.error(`Found requested active service in : ${zoneServices[key2]["Zone"]}`);

          if (!result) {
            result = { zone: { actionable: [], speakable: [] } };
          }
          result.zone.actionable.push(zone);
          result.zone.speakable.push(zone);
        }
      }
    }

    if (!result) {
      analyticsEvent.sendError([`activeServiceNameMatcher Match not active: ${serviceName}`]);
      deferred.reject({ type: "endSession", exception: "serviceNotActive" });
      return deferred.promise;
    } else {
      result.service = { name: serviceName };
      deferred.resolve(result);
    }
  });

  analyticsEvent.sendTime("Matching", "service.active");
  return deferred.promise;
}

module.exports = {
  available,
  active
};