const
  savantLib = require('../savantLib'),
  fuzzy = require('./fuzzy'),
  _ = require('lodash'),
  didYouMean = require('didyoumean'),
  similarity = require("similarity"),
  q = require('q');

function getChannel(activeZone,requestedChannel){
  var a = new eventAnalytics.event();
  var defer = q.defer();
  if (!requestedChannel){var requestedChannel = ''}
  log.error('matcher.getChannel - looking for: "'+requestedChannel+'"')
  savantLib.readStateQ(activeZone+'.ActiveService')
    .then(function (activeService){
      var activeServiceArray = activeService.split('-')
      if (!_.includes(activeServiceArray[1],_.keys(appDictionaryChannels[activeZone]))){
        defer.reject({type:"endSession",exception:"tvNotActive"})
        return defer.promise
      }else{
        return activeServiceArray[1]
      }
    })
    .then(function (activeSourceComponent){
      var zoneChannels = appDictionaryChannels[activeZone][activeSourceComponent]
      var channelNames = _.keys(zoneChannels)
      //log.error("zoneChannels: "+JSON.stringify(zoneChannels))
      //log.error("channelNames: "+JSON.stringify(channelNames))
      var matchedChannelObj = fuzzy.findBest(requestedChannel,channelNames)
      defer.resolve({
        number:zoneChannels[matchedChannelObj.name],
        name:matchedChannelObj.name,
        score:matchedChannelObj.score
      });
  });
  a.sendTime("Matching","channel.getChannel");
  return defer.promise
}

module.exports = {
  getChannel:getChannel
}
