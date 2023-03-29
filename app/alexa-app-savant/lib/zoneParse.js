"use strict";

// Import the required modules
const plist = require('simple-plist');
const fs = require('fs');
const _ = require('lodash');
const q = require('q');

// Function to get zones
// Takes the name of the plist file and a callback function
// Returns a promise that resolves to an array of zone names
function getZones(plistFile) {
  return q.nfcall(plist.readFile, plistFile)
    .then(function(obj) {
      obj = obj.ServiceOrderPerZone;
      var ret = Object.keys(obj);
      return ret;
    });
}

// Function to get zone services
// Takes the name of the plist file and a callback function
// Returns a promise that resolves to an object of zone services
function getZoneServices(plistFile) {
  return q.nfcall(plist.readFile, plistFile)
    .then(function(obj) {
      obj = obj.ServiceOrderPerZone;
      var ret = {}

      for (var key in obj) {
        var serviceObj = {};
        var i = 0;
        var zone = obj[key];
        
        for (var key2 in zone) {
          let value = zone[key2];
          let type = _.get(value, 'Service Type');
          let disabledTypes = [
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
            serviceObj[i] = {
              "Zone": key,
              "Source Component": value["Source Component"],
              "Source Logical Component": value["Source Logical Component"],
              "Service Variant ID": value["Service Variant ID"],
              "Service Type": value["Service Type"],
              "Alias": value["Alias"]
            };
          
            i++;
          }
        }
        
        ret[key] = serviceObj;
      }
      
      return ret;
    });
}

// Function to get service names
// Takes the name of the plist file
// Returns a promise that resolves to an object of unique source components and service aliases
function getServiceNames(plistFile) {
  return q.nfcall(plist.readFile, plistFile)
    .then(function(obj) {
      obj = obj.ServiceOrderPerZone;
      var ret = {
        "sourceComponent": [],
        "serviceAlias": []
      };
      
      for (var key in obj) {
        let zone = obj[key];
        
        for (var key2 in zone) {
          let value = zone[key2];
          let type = _.get(value, 'Service Type');
          let disabledTypes = [
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
            ret.sourceComponent.push(value["Source Component"]);
            ret.serviceAlias.push(value["Alias"]);
          }
        }
      }
      
      ret.sourceComponent = _.uniq(ret.sourceComponent);
      ret.serviceAlias = _.uniq(ret.serviceAlias);
      
      return ret;
    });
}

// Function to get zone organization
// Takes the name of the plist file
// Returns a promise that resolves to an object of zone groups and an array of zone group names
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
        
        for (var key2 in zoneGroupsObj) {
          let value = zoneGroupsObj[key2];
          dic[key2] = value["Identifier"];
        }
        
        retObj[zoneGroupName] = dic;
      }
      
      return [retObj, retArray];
    });
}

// Function to get channels
// Takes the name of the plist file
// Returns a promise that resolves to an object of zone channels and an array of channel names
function getChannels(plistFile) {
  return q.nfcall(plist.readFile, plistFile)
    .then(function(obj) {
      var ret = {};
      var channelNameArray = [];
      
      for (var key in obj) {
        var zoneChannelNameArray = [];
        var keyArray = key.split('-');
        
        if (keyArray[4] === 'SVC_AV_TV') {
          var zoneChans = {}
          _.forEach(obj[key],function(value,key) {
            _.set(zoneChans,value.Name,key)
            zoneChannelNameArray.push(value.Name)
          })
          
          var serviceName = keyArray[1];
          var zoneObj = {}
          _.set(zoneObj,serviceName,zoneChans);
          _.set(ret,keyArray[0],zoneObj)
          channelNameArray = zoneChannelNameArray
        }
      }
      
      channelNameArray = _.uniq(channelNameArray)
      
      return [ret, channelNameArray];
    });
}

// Export the functions
module.exports = {
  getZones: getZones,
  getZoneServices: getZoneServices,
  getServiceNames: getServiceNames,
  getZoneOrganization: getZoneOrganization,
  getChannels: getChannels
}