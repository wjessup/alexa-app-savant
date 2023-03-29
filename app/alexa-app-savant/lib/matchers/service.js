const savantLib = require('../savantLib');
const didYouMean = require('didyoumean');
const action = require('../actionLib');
const eventAnalytics = require('../eventAnalytics');
const _ = require('lodash');
const q = require('q');

// Check if given service is available in each zone
function available(actionableZones, serviceIn) {
  const a = new eventAnalytics.event();
  const serviceArray = [];
  const defer = q.defer();
  
  // Looping through each zone
  for (let key in actionableZones) {
    const cleanZone = actionableZones[key];
    const zoneServices = systemServices[cleanZone];
    const matchingAlias = didYouMean(serviceIn, _.map(zoneServices, 'Alias'));
    const matchingSourceComponent = didYouMean(serviceIn, _.map(zoneServices, 'Source Component'));
    let foundService;
    
    log.info(`matcher.service.available - Trying to match service ${serviceIn} in ${cleanZone}`);
    
    // Get the index of the matched service
    const foundServiceAliasIndex = _.findIndex(zoneServices, { Alias: matchingAlias });
    const foundServiceComponentIndex = _.findIndex(zoneServices, { 'Source Component': matchingSourceComponent });
    
    // Get service array if an index was found
    if (foundServiceAliasIndex !== -1) foundService = zoneServices[foundServiceAliasIndex];
    else if (foundServiceComponentIndex !== -1) foundService = zoneServices[foundServiceComponentIndex];
    
    // If we found a service save array into serviceArray
    if (foundService) {
      serviceArray.push([
        foundService.Zone, foundService['Source Component'], foundService['Source Logical Component'],
        foundService['Service Variant ID'], foundService['Service Type'], foundService.Alias,
      ]);
    } else {
      a.sendError(`serviceMatcher Fail: ${serviceIn}`);
      defer.reject('zoneNotFound');
      return defer.promise;
    }
  }
  
  const ret = {
    serviceArray,
    name: serviceIn,
  };
  
  log.debug(`matcher.service.available - ${JSON.stringify(ret)}`);
  defer.resolve(ret);
  a.sendTime('Matching', 'service.available');
  
  return defer.promise;
}

// Check if given service is active
function active(serviceIn) {
  const a = new eventAnalytics.event();
  const activeServicesArray = [];
  const defer = q.defer();
  let ret;
  
  // Get the closest service name for a given service in appDictionaryServiceNameArray
  const serviceName = didYouMean(serviceIn, appDictionaryServiceNameArray);
  
  if (!serviceName) {
    // We did not find a match in alias or profile names
    a.sendError(`activeServiceNameMatcher Fail: ${serviceIn}`);
    defer.reject('zoneNotFound');
    return defer.promise;
  }
  
  log.error(`Trying to match request: ${serviceName}`);
  
  // Build ActiveService states
  let stateRequest = '';
  for (let key in appDictionaryArray) {
    stateRequest = stateRequest.concat(`"${appDictionaryArray[key]}.ActiveService" `);
  }
  stateRequest = stateRequest.substring(1, stateRequest.length - 2);
  
  savantLib.readMultipleState(stateRequest, (activeServices, stateIn) => {
    // Active services are split by '-'
    activeServices = _.map(activeServices, val => val.split('-'));
    
    // Check if given service is available in each zone
    activeServices.forEach(activeService => {
      const zone = activeService[0];
      const zoneServices = systemServices[zone];
      
      zoneServices.forEach(zoneService => {
        if (zoneService.Alias === serviceName && zoneService['Source Component'] === activeService[1] 
             || zoneService['Source Component'] === serviceName && zoneService['Source Component'] === activeService[1]) {
          log.error(`Found requested active service in : ${zoneService.Zone}`);
          if (!ret) {
            ret = {
              zone: {
                actionable: [],
                speakable: [],
              },
            };
          }
          ret.zone.actionable.push(zone);
          ret.zone.speakable.push(zone);
        }
      });
    });
    
    if (!ret) {
      // We did not match an active service
      a.sendError(`activeServiceNameMatcher Match not active: ${serviceName}`);
      defer.reject({ type: 'endSession', exception: 'serviceNotActive' });
      return defer.promise;
    }
    
    // We matched an active service, return
    ret.service = {
      name: serviceName,
    };
    
    defer.resolve(ret);
  });
  
  a.sendTime('Matching', 'service.active');
  return defer.promise;
}

module.exports = {
  available,
  active,
}