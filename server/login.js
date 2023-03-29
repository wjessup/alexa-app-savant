"use strict";

const plist = require("simple-plist");
const fs = require("fs");
const _ = require("lodash");
const q = require("q");

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
  "SVC_ENV_SECURITYCAMERA",
];

function readFile(plistFile) {
  return q.nfcall(plist.readFile, plistFile);
}

// getZones
function getZones(plistFile) {
  return readFile(plistFile).then((obj) =>
    Object.keys(obj.ServiceOrderPerZone)
  );
}

// getZoneServices
function getZoneServices(plistFile) {
  return readFile(plistFile).then((obj) => {
    const zones = obj.ServiceOrderPerZone;
    let result = {};

    for (const zone in zones) {
      result[zone] = Object.entries(zones[zone])
        .filter(
          ([_, value]) =>
            value.Enabled === 1 &&
            (!value["Service Type"] ||
              !disabledTypes.includes(value["Service Type"]))
        )
        .map(([key, value]) => ({
          Zone: zone,
          "Source Component": value["Source Component"],
          "Source Logical Component": value["Source Logical Component"],
          "Service Variant ID": value["Service Variant ID"],
          "Service Type": value["Service Type"],
          Alias: value["Alias"],
        }));
    }
    return result;
  });
}

// getServiceNames
function getServiceNames(plistFile) {
  return readFile(plistFile).then((obj) => {
    const services = obj.ServiceOrderPerZone;
    let sourceComponent = [];
    let serviceAlias = [];

    for (const zone in services) {
      for (const value of Object.values(services[zone])) {
        if (
          value.Enabled === 1 &&
          (!value["Service Type"] || !disabledTypes.includes(value["Service Type"]))
        ) {
          sourceComponent.push(value["Source Component"]);
          serviceAlias.push(value["Alias"]);
        }
      }
    }

    return {
      sourceComponent: _.uniq(sourceComponent),
      serviceAlias: _.uniq(serviceAlias),
    };
  });
}

// getZoneOrganization
function getZoneOrganization(plistFile) {
  return readFile(plistFile).then((obj) => {
    const zoneOrderList = obj.RPMZoneOrderList;

    let result = {};
    let zoneGroupNames = zoneOrderList.map(({ RPMGroupName, Children }) => {
      result[RPMGroupName] = _.mapValues(Children, "Identifier");
      return RPMGroupName;
    });

    return [result, zoneGroupNames];
  });
}

// getChannels
function getChannels(plistFile) {
  return readFile(plistFile).then((obj) => {
    let result = {};
    let channelNames = [];

    for (const key in obj) {
      let [zone, serviceName] = key.split("-");
      if (serviceName === "SVC_AV_TV") {
        let channels = _.mapValues(obj[key], "Name");
        channelNames.push(...Object.values(channels));

        result[zone] = { [serviceName]: channels };
      }
    }

    return [result, _.uniq(channelNames)];
  });
}

module.exports = {
  getZones,
  getZoneServices,
  getServiceNames,
  getZoneOrganization,
  getChannels,
};