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
  "SVC_ENV_SECURITYCAMERA"
];

const readPlistFile = (plistFile) => q.nfcall(plist.readFile, plistFile);

// Extracts enabled services only
const extractEnabledServices = (services) =>
  _.filter(services, (service) => {
    const type = _.get(service, "Service Type");
    return (
      service.Enabled === 1 && (!type || !_.includes(disabledTypes, type))
    );
  });

const getZones = async (plistFile) => {
  const obj = await readPlistFile(plistFile);
  return Object.keys(obj.ServiceOrderPerZone);
};

const getZoneServices = async (plistFile) => {
  const obj = await readPlistFile(plistFile);
  const serviceOrderPerZone = obj.ServiceOrderPerZone;

  return _.mapValues(serviceOrderPerZone, (zones, key) => {
    return _.transform(
      extractEnabledServices(zones),
      (accumulator, service, index) => {
        accumulator[index] = {
          ..._.pick(service, [
            "Source Component",
            "Source Logical Component",
            "Service Variant ID",
            "Service Type",
            "Alias"
          ]),
          Zone: key
        };
      },
      {}
    );
  });
};

const getServiceNames = async (plistFile) => {
  const obj = await readPlistFile(plistFile);
  const services = _.flatMap(obj.ServiceOrderPerZone);
  const enabledServices = extractEnabledServices(services);

  return {
    sourceComponent: _.uniq(_.map(enabledServices, "Source Component")),
    serviceAlias: _.uniq(_.map(enabledServices, "Alias"))
  };
};

const getZoneOrganization = async (plistFile) => {
  const obj = await readPlistFile(plistFile);
  const zoneOrderList = obj.RPMZoneOrderList;

  return _.reduce(
    zoneOrderList,
    (accumulator, zoneOrder) => {
      const groupName = zoneOrder.RPMGroupName;
      accumulator.array.push(groupName);
      accumulator.object[groupName] = _.mapValues(
        zoneOrder.Children,
        "Identifier"
      );
      return accumulator;
    },
    { object: {}, array: [] }
  );
};

const getChannels = async (plistFile) => {
  const obj = await readPlistFile(plistFile);

  return _.reduce(
    obj,
    (accumulator, zones, key) => {
      const keyArray = key.split("-");
      if (keyArray[4] === "SVC_AV_TV") {
        const serviceName = keyArray[1];
        _.assign(accumulator.object, {
          [keyArray[0]]: { [serviceName]: _.mapValues(zones, "Name") }
        });
        accumulator.array = _.uniq(
          accumulator.array.concat(_.map(zones, "Name"))
        );
      }
      return accumulator;
    },
    { object: {}, array: [] }
  );
};

module.exports = {
  getZones,
  getZoneServices,
  getServiceNames,
  getZoneOrganization,
  getChannels
};