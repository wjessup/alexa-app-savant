"use strict";

const plist = require('simple-plist');
const fs = require('fs');
const _ = require('lodash');
const q = require('q');

const disabledTypes = [
  "SVC_GEN_GENERIC",
  "SVC_ENV_LIGHTING",
  "SVC_ENV_HVAC",
  "SVC_ENV_FAN",
  "SVC_ENV_SHADE",
  "SVC_SETTINGS_STEREO",
  "SVC_SETTINGS_SURROUNDSOUND",
  "SVC_ENV_GENERALRELAYCONTROLLEDDEVICE",
  "nonService",
  "SVC_ENV_SECURITYCAMERA"
];

function readPlistFile(plistFile) {
  return q.nfcall(plist.readFile, plistFile);
}

function getZones(plistFile) {
  return readPlistFile(plistFile).then((obj) => Object.keys(obj.ServiceOrderPerZone));
}

function getZoneServices(plistFile) {
  return readPlistFile(plistFile).then((obj) => {
    const zoneServices = {};
    const services = obj.ServiceOrderPerZone;

    for (const [zone, zoneServiceList] of Object.entries(services)) {
      zoneServices[zone] = getEnabledServices(zoneServiceList, zone);
    }

    return zoneServices;
  });
}

function getEnabledServices(zoneServiceList, zone) {
  return zoneServiceList.reduce((enabledServices, zoneService, index) => {
    const serviceType = _.get(zoneService, 'Service Type');
    if (zoneService.Enabled === 1 && (!serviceType || !disabledTypes.includes(serviceType))) {
      enabledServices[index] = {
        Zone: zone,
        "Source Component": zoneService["Source Component"],
        "Source Logical Component": zoneService["Source Logical Component"],
        "Service Variant ID": zoneService["Service Variant ID"],
        "Service Type": zoneService["Service Type"],
        Alias: zoneService.Alias
      };
    }
    return enabledServices;
  }, {});
}

function getServiceNames(plistFile) {
  return readPlistFile(plistFile).then((obj) => {
    const serviceNames = {
      sourceComponent: [],
      serviceAlias: []
    };

    for (const key in obj.ServiceOrderPerZone){
      for (const value of Object.values(obj.ServiceOrderPerZone[key])){
        const serviceType = _.get(value, 'Service Type');
        if (value.Enabled === 1 && (!serviceType || !disabledTypes.includes(serviceType))) {
          serviceNames.sourceComponent.push(value["Source Component"]);
          serviceNames.serviceAlias.push(value["Alias"]);
        }
      }
    }
    serviceNames.sourceComponent = _.uniq(serviceNames.sourceComponent);
    serviceNames.serviceAlias = _.uniq(serviceNames.serviceAlias);
    return serviceNames;
  });
}

function getZoneOrganization(plistFile) {
  return readPlistFile(plistFile).then((obj) => {
    const result = {
      groups: {},
      groupOrder: []
    };

    obj.RPMZoneOrderList.forEach((groupData) => {
      const groupName = groupData.RPMGroupName;
      result.groups[groupName] = extractChildrenIdentifiers(groupData.Children);
      result.groupOrder.push(groupName);
    });
    return result;
  });
}

function extractChildrenIdentifiers(children) {
  return children.reduce((identifiers, child, index) => {
    identifiers[index] = child.Identifier;
    return identifiers;
  }, {});
}

function getChannels(plistFile) {
  return readPlistFile(plistFile).then((obj) => {
    const result = {
      channels: {},
      channelNames: []
    };

    for (const [key, channelData] of Object.entries(obj)) {
      const keyParts = key.split('-');
      if (keyParts[4] === 'SVC_AV_TV') {
        const serviceName = keyParts[1];
        const zoneChannels = mapChannelNames(channelData);
        result.channels[keyParts[0]] = { [serviceName]: zoneChannels };
        result.channelNames.push(...Object.values(zoneChannels));
      }
    }

    result.channelNames = _.uniq(result.channelNames);
    return result;
  });
}

function mapChannelNames(channelData) {
  const channelNames = {};
  Object.entries(channelData).forEach(([key, channel]) => {
    channelNames[key] = channel.Name;
  });
  return channelNames;
}

module.exports = {
  getZones,
  getZoneServices,
  getServiceNames,
  getZoneOrganization,
  getChannels
};