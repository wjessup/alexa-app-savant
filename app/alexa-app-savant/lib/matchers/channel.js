const
  savantLib = require('../savantLib'),
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
      var matchedChannelObj = findBestChannel(requestedChannel,channelNames)
      defer.resolve({
        number:zoneChannels[matchedChannelObj.name],
        name:matchedChannelObj.name,
        score:matchedChannelObj.score
      });
  });
  a.sendTime("Matching","channel.getChannel");
  return defer.promise
}


function findBestChannel(requestedChannel,channelNames) {
  var best = { score: 0, name:''};
  _.forEach(channelNames,function(channel){
    //log.error('requestedChannel: '+requestedChannel)
    //log.error('channel: '+channel)
    var distance = similarity(requestedChannel, channel)
    log.debug(channel+' was scored: '+distance)
    if (distance > best.score){
      best.score = distance;
      best.name = channel;
      log.debug("best Match: "+best.name+" @ "+best.score)
    }
  })
  return best;
}


module.exports = {
  getChannel:getChannel
}
