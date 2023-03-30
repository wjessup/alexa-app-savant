/**
 * Searches for a service by alias in a specified zone.
 * @param {object} zoneServices - the services in the specified zone.
 * @param {string} serviceAlias - the alias of the requested service.
 * @returns {object|null} The service object if found, else null.
 */
function findServiceByAlias(zoneServices, serviceAlias) {
  const foundServiceAliasIndex = _.findIndex(zoneServices, ["Alias", didYouMean(serviceAlias, _.map(zoneServices, "Alias"))]);
  if (foundServiceAliasIndex !== -1) {
    return zoneServices[foundServiceAliasIndex];
  }
  return null;
}

/**
 * Searches for a service by component in a specified zone.
 * @param {object} zoneServices - the services in the specified zone.
 * @param {string} serviceComponent - the component of the requested service.
 * @returns {object|null} The service object if found, else null.
 */
function findServiceByComponent(zoneServices, serviceComponent) {
  const foundServiceComponentIndex = _.findIndex(zoneServices, ["Source Component", didYouMean(serviceComponent, _.map(zoneServices, "Source Component"))]);
  if (foundServiceComponentIndex !== -1) {
    return zoneServices[foundServiceComponentIndex];
  }
  return null;
}

/**
 * Finds whether the requested service is available in the given zones.
 * @param {object} actionableZones - zones to be searched.
 * @param {string} serviceName - the name of the requested service.
 * @returns {Promise} Promise object represents the list of all services available in the passed zones.
 */
function available(actionableZones, serviceName) {
  const a = new eventAnalytics.event();
  const serviceArray = [];

  for (const cleanZone of Object.values(actionableZones)) {
    const zoneServices = systemServices[cleanZone];
    log.info(`matcher.service.available - Trying to match service ${serviceName} in ${cleanZone}`);

    const foundService = findServiceByAlias(zoneServices, serviceName) || findServiceByComponent(zoneServices, serviceName);
      
    if (!foundService) {
      a.sendError(`serviceMatcher Fail: ${serviceName}`);
      return Promise.reject("zoneNotFound");
    }

    const foundServiceArray = [
      foundService["Zone"],
      foundService["Source Component"],
      foundService["Source Logical Component"],
      foundService["Service Variant ID"],
      foundService["Service Type"],
      foundService["Alias"]
    ];
      
    serviceArray.push(foundServiceArray);
  }

  const ret = {
    serviceArray: serviceArray,
    name: serviceName
  };
  log.debug(`matcher.service.available - ${JSON.stringify(ret)}`);
  
  a.sendTime("Matching", "service.available");
  return Promise.resolve(ret);
}

/**
 * Finds whether the requested service is active and available in any of the zones.
 * @param {string} serviceName - the name of the requested service.
 * @returns {Promise} Promise object that represents whether active service is found or not.
 */
function active(serviceName) {
  const a = new eventAnalytics.event();
  const activeServicesArray = [];
    
  const matchedServiceName = didYouMean(serviceName, appDictionaryServiceNameArray);
  if (matchedServiceName === null) {
    a.sendError(`activeServiceNameMatcher Fail: ${serviceName}`);
    return Promise.reject("zoneNotFound");
  }

  log.error(`Trying to match request: ${serviceName}`);
  let stateRequest = "";
  for (const sysSvc of appDictionaryArray) {
    stateRequest += `"${sysSvc}.ActiveService" `;
  }
  stateRequest = stateRequest.slice(0, -1);
  
  return new Promise((resolve, reject) => {
    savantLib.readMultipleState(stateRequest, (activeServices,stateIn) => {
      for (const activeService of Object.values(activeServices)) {
        activeServicesArray.push(activeService.split("-"));
      }
      
      for (const activeSvcArray of Object.values(activeServicesArray)) {
        const zone = activeSvcArray[0];
        const zoneServices = systemServices[zone];
        for (const zoneService of Object.values(zoneServices)) {
          if (
            (zoneService["Alias"] === matchedServiceName && zoneService["Source Component"] === activeSvcArray[1]) ||
            (zoneService["Source Component"] === matchedServiceName && zoneService["Source Component"] === activeSvcArray[1])
          ) {
            log.error(`Found requested active service in: ${zoneService["Zone"]}`);
            const ret = {
              zone: {
                actionable: [zone],
                speakable: [zone]
              },
              service: {
                name: matchedServiceName
              }
            };
            resolve(ret);
            return;
          }
        }
      }

      a.sendError(`activeServiceNameMatcher Match not active: ${matchedServiceName}`);
      reject({type: "endSession", exception: "serviceNotActive"});
    });
  });
}

module.exports = { available, active };