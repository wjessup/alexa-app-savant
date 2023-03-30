"use strict";

const plist = require('simple-plist');
const fs = require('fs');
const _ = require('lodash');
const q = require('q');

function getZones(plistFile) {
  return q.nfcall(plist.readFile, plistFile)
    .then(function(obj) {
      obj = obj.ServiceOrderPerZone;
      return Object.keys(obj);
    });
}

function getZoneServices(plistFile) {
  return q.nfcall(plist.readFile, plistFile)
    .then(function(obj) {
      obj = obj.ServiceOrderPerZone;
      var serviceObj = {};

      for (var key in obj) {
        serviceObj[key] = [];

        Object.keys(obj[key]).forEach(function(key2) {
          let value = obj[key][key2];
          let type = _.get(value, 'Service Type');
          
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
          
          if (value.Enabled === 1 && (!type || !_.includes(disabledTypes, type))) {
            serviceObj[key].push({
              "Zone": key,
              "Source Component": value["Source Component"],
              "Source Logical Component": value["Source Logical Component"],
              "Service Variant ID": value["Service Variant ID"],
              "Service Type": value["Service Type"],
              "Alias": value["Alias"]
            });
          }
        });
      }

      return serviceObj;
    });
}

function getServiceNames(plistFile) {
  return q.nfcall(plist.readFile, plistFile)
    .then(function(obj) {
      obj = obj.ServiceOrderPerZone;
      
      var sourceComponent = [];
      var serviceAlias = [];
      
      for (var key in obj) {
        for (var key2 in obj[key]) {
          let value = obj[key][key2];
          let type = _.get(value, 'Service Type');
          
          const disabledTypes = [
            "SVC_GEN_GENERIC",
            "SVC_ENV_LIGHTING",
            "SVC_ENV_HVAC",
            "SVC_ENV_SHADE",
            "SVC_SETTINGS_STEREO",
            "SVC_SETTINGS_SURROUNDSOUND",
            "SVC_ENV_GENERALRELAYCONTROLLEDDEVICE",
            "nonService",
            "SVC_ENV_SECURITYCAMERA"
          ];
          
          if (value.Enabled === 1 && (!type || !_.includes(disabledTypes, type))) {
            sourceComponent.push(value["Source Component"]);
            serviceAlias.push(value["Alias"]);
          }
        }
      }
      
      sourceComponent = _.uniq(sourceComponent);
      serviceAlias = _.uniq(serviceAlias);
      
      return {
        "sourceComponent": sourceComponent,
        "serviceAlias": serviceAlias
      };
    });
}

function getZoneOrganization(plistFile) {
  return q.nfcall(plist.readFile, plistFile)
    .then(function(obj) {
      obj = obj.RPMZoneOrderList;
      var retObj = {};
      var retArray = [];

      for (var key in obj) {
        var zoneGroupName = obj[key]["RPMGroupName"];
        retArray.push(zoneGroupName);

        var zoneGroupsObj = obj[key]["Children"];
        var dic = {};

        Object.keys(zoneGroupsObj).forEach(function(key2) {
          let value = zoneGroupsObj[key2];
          dic[key2] = value["Identifier"];
        });

        retObj[zoneGroupName] = dic;
      }

      return [retObj, retArray];
    });
}

function getChannels(plistFile) {
  return q.nfcall(plist.readFile, plistFile)
    .then(function(obj) {
      var ret = {};
      var channelNameArray = [];

      Object.keys(obj).forEach(function(key) {
        var zoneChannelNameArray = [];
        var keyArray = key.split('-');
        
        if (keyArray[4] === 'SVC_AV_TV') {
          var zoneChans = {};
          
          Object.keys(obj[key]).forEach(function(value, key) {
            _.set(zoneChans, value.Name, key);
            zoneChannelNameArray.push(value.Name);
          });
          
          var serviceName = keyArray[1];
          var zoneObj = {};
          
          _.set(zoneObj, serviceName, zoneChans);
          _.set(ret, keyArray[0], zoneObj);
          channelNameArray = zoneChannelNameArray;
        }
      });
      
      channelNameArray = _.uniq(channelNameArray);
      
      return [ret, channelNameArray];
    });
}

module.exports = {
  getZones,
  getZoneServices,
  getServiceNames,
  getZoneOrganization,
  getChannels
};