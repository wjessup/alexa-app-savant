const savantLib = require('../savantLib');
const didYouMean = require('didyoumean');
const action = require('../actionLib');
const eventAnalytics = require('../eventAnalytics');
const _ = require('lodash');
const q = require('q');

function available(actionableZones, serviceIn) {
  const a = new eventAnalytics.event();
  const defer = q.defer();
  const serviceArray = [];

  for (const key in actionableZones) {
    const cleanZone = actionableZones[key];
    const zoneServices = systemServices[cleanZone];

    const foundServiceAliasIndex = _.findKey(zoneServices, ["Alias", didYouMean(serviceIn, _.map(zoneServices, "Alias"))]);
    const foundServiceComponentIndex = _.findKey(zoneServices, ["Source Component", didYouMean(serviceIn, _.map(zoneServices, "Source Component"))]);

    let foundService;
    if (foundServiceAliasIndex) {
      foundService = zoneServices[foundServiceAliasIndex];
    } else if (foundServiceComponentIndex) {
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
      a.sendError("serviceMatcher Fail: " + serviceIn);
      defer.reject("zoneNotFound");
      return defer.promise;
    }
  }

  const ret = { serviceArray, name: serviceIn };
  defer.resolve(ret);
  a.sendTime("Matching", "service.available");
  return defer.promise;
}

function active(serviceIn) {
  const a = new eventAnalytics.event();
  const defer = q.defer();
  let stateRequest = '';

  const serviceName = didYouMean(serviceIn, appDictionaryServiceNameArray);
  if (!serviceName) {
    a.sendError("activeServiceNameMatcher Fail: " + serviceIn);
    defer.reject("zoneNotFound");
    return defer.promise;
  }

  for (const key in appDictionaryArray) {
    stateRequest += `"${appDictionaryArray[key]}.ActiveService" `;
  }
  stateRequest = stateRequest.trim();

  savantLib.readMultipleState(stateRequest, function (activeServices) {
    const activeServicesArray = activeServices.map(service => service.split("-"));
    let ret;

    for (const key in activeServicesArray) {
      const zone = activeServicesArray[key][0];
      const zoneServices = systemServices[zone];

      for (const key2 in zoneServices) {
        const isMatchedService = 
          (zoneServices[key2]["Alias"] === serviceName && zoneServices[key2]["Source Component"] === activeServicesArray[key][1]) ||
          (zoneServices[key2]["Source Component"] === serviceName && zoneServices[key2]["Source Component"] === activeServicesArray[key][1]);

        if (isMatchedService) {
          if (!ret) {
            ret = { zone: { actionable: [], speakable: [] } };
          }
          ret.zone.actionable.push(zone);
          ret.zone.speakable.push(zone);
        }
      }
    }

    if (!ret) {
      a.sendError(["activeServiceNameMatcher Match not active: " + serviceName]);
      defer.reject({ type: "endSession", exception: "serviceNotActive" });
    } else {
      ret.service = { name: serviceName };
      defer.resolve(ret);
    }
  });

  a.sendTime("Matching", "service.active");
  return defer.promise;
}

module.exports = {
  available,
  active
};