const savantLib = require('../savantLib');
const fuzzy = require('./fuzzy');
const _ = require('lodash');
const didYouMean = require('didyoumean');
const similarity = require('similarity');
const q = require('q');

function getChannel(activeZone, requestedChannel = '') {
  const a = new eventAnalytics.event();
  const defer = q.defer();
  console.log(`matcher.getChannel - looking for: "${requestedChannel}"`);

  savantLib.readStateQ(`${activeZone}.ActiveService`)
    .then((activeService) => {
      const activeServiceArray = activeService.split('-');
      if (!_.includes(activeServiceArray[1], _.keys(appDictionaryChannels[activeZone]))) {
        defer.reject({
          type: 'endSession',
          exception: 'tvNotActive',
        });
        return defer.promise;
      }
      return activeServiceArray[1];
    })
    .then((activeSourceComponent) => {
      const zoneChannels = appDictionaryChannels[activeZone][activeSourceComponent];
      const channelNames = Object.keys(zoneChannels);
      const matchedChannelObj = fuzzy.findBest(requestedChannel, channelNames);
      console.log(`zoneChannels: ${JSON.stringify(zoneChannels)}`);
      console.log(`channelNames: ${JSON.stringify(channelNames)}`);
      defer.resolve({
        number: zoneChannels[matchedChannelObj.name],
        name: matchedChannelObj.name,
        score: matchedChannelObj.score,
      });
    })
    .catch((err) => {
      console.error(`Error occurred: ${err}`);
      defer.reject(err);
    });
  
  a.sendTime('Matching', 'channel.getChannel');
  return defer.promise;
}

module.exports = {
  getChannel,
};