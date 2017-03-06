"use strict";

const
  plist = require('simple-plist'),
  fs = require('fs'),
  _ = require('lodash'),
  q = require('q');



function getZones(plistFile, callback) {
  return q.nfcall(plist.readFile, plistFile)
  .then(function(obj) {
    obj = obj.ServiceOrderPerZone;
    var ret = []
    for (var key in obj){
      ret.push(key);
    }
    return ret;
  })
}

function getZoneServices(plistFile, callback) {
  return q.nfcall(plist.readFile, plistFile)
  .then(function(obj) {
    obj = obj.ServiceOrderPerZone;
    var ret = {}

    for (var key in obj){
      var dic = []
      var serviceObj = {};
      var i = 0
      for (var key2 in obj[key]){
        let value = obj[key][key2]; // map references is time consuming so let’s do it only once
        let type = _.get(value, 'Service Type');
        let disabledTypes = ["SVC_GEN_GENERIC","SVC_ENV_LIGHTING","SVC_ENV_HVAC","SVC_ENV_FAN",
          "SVC_ENV_SHADE","SVC_SETTINGS_STEREO","SVC_SETTINGS_SURROUNDSOUND",
          "SVC_ENV_GENERALRELAYCONTROLLEDDEVICE","nonService","SVC_ENV_SECURITYCAMERA"
        ];
        if (value.Enabled === 1 && (!type || !_.includes(disabledTypes, type))) {
          serviceObj[i] = {};
          serviceObj[i]["Zone"] = key;
          serviceObj[i]["Source Component"] =  obj[key][key2]["Source Component"];
          serviceObj[i]["Source Logical Component"] = obj[key][key2]["Source Logical Component"];
          serviceObj[i]["Service Variant ID"] = obj[key][key2]["Service Variant ID"];
          serviceObj[i]["Service Type"] = obj[key][key2]["Service Type"];
          serviceObj[i]["Alias"] = obj[key][key2]["Alias"];
          i++;
        }
      }
      ret[key] = serviceObj;
    }
    return ret
  })
}

function getServiceNames(plistFile) {
  return q.nfcall(plist.readFile, plistFile)
  .then(function(obj) {
    obj = obj.ServiceOrderPerZone;
    var ret = {
      "sourceComponent" : [],
      "serviceAlias" : []
    }
    for (var key in obj){
      for (var key2 in obj[key]){
        let value = obj[key][key2]; // map references is time consuming so let’s do it only once
        let type = _.get(value, 'Service Type');
        let disabledTypes = ["SVC_GEN_GENERIC","SVC_ENV_LIGHTING","SVC_ENV_HVAC",
          "SVC_ENV_SHADE","SVC_SETTINGS_STEREO","SVC_SETTINGS_SURROUNDSOUND",
          "SVC_ENV_GENERALRELAYCONTROLLEDDEVICE","nonService","SVC_ENV_SECURITYCAMERA"
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
  })
}

function getZoneOrganization(plistFile, callback) {
  return q.nfcall(plist.readFile, plistFile)
  .then(function(obj) {
    obj = obj.RPMZoneOrderList;
    var retObj = {};
    var retArray = [];
    for (var key in obj){
      var zoneGroupName = obj[key]["RPMGroupName"];
      retArray.push(zoneGroupName);
      var zoneGroupsObj = obj[key]["Children"];
      var dic = {};
      for (var key2 in zoneGroupsObj){
        let value = zoneGroupsObj[key2];
        dic[key2] = value["Identifier"];
      }
      retObj[zoneGroupName] = dic;
    }
    return [retObj,retArray]
  });
}

function getChannels(plistFile) {
  return q.nfcall(plist.readFile, plistFile)
  .then(function(obj) {
    var ret = {};
    var channelNameArray = [];
    for (var key in obj) {
      var zoneChannelNameArray = [];
      var keyArray = key.split('-')
      if (keyArray[4]==='SVC_AV_TV'){
        var zoneChans = {}
        _.forEach(obj[key],function(value,key){
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
    return [ret,channelNameArray]
  });
}

module.exports = {
getZones: getZones,
getZoneServices: getZoneServices,
getServiceNames: getServiceNames,
getZoneOrganization: getZoneOrganization,
getChannels:getChannels
}
