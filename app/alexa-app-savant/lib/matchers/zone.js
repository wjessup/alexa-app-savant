const didYouMean = require('didyoumean');
const _ = require('lodash');
const q = require('q');
const stringLib = require('../stringLib');
const eventAnalytics = require('../eventAnalytics');
const voiceMessages = require('../voiceMessages.json');


function single(zoneIn, callback) {
  const a = new eventAnalytics.event();
  console.log('matcherZone.single -  Matching requested zone...');
  console.log(`matcherZone.single -  zoneIn: ${zoneIn}`);
  const editZone = zoneIn.replace(/the/gi, '');
  const cleanZone = didYouMean(editZone, appDictionaryArray);
  if (!cleanZone) {
    a.sendError(`Single Zone Match Fail: ${zoneIn}`);
    callback(voiceMessages.error.zoneNotFound, undefined);
  } else {
    a.sendTime('Matching', 'Single');
    callback(undefined, cleanZone);
  }
}

function multi(rawZone1, rawZone2) {
  const a = new eventAnalytics.event();
  const matchedKeyGroups = [];
  const ret = {};
  console.log('matcherZone.multi - Matching requested zones...');
  const defer = q.defer();
  let lowerRawZone1 = _.toLower(rawZone1) || '';
  let lowerRawZone2 = _.toLower(rawZone2) || '';
  const hasFirst = appDictionaryGroupArrayLowerCase.filter((item) =>
    item.indexOf('1st') >= 0);
  if (hasFirst.length) {
    lowerRawZone1 = lowerRawZone1.replace(/1st/ig, 'first');
    lowerRawZone2 = lowerRawZone2.replace(/1st/ig, 'first');
  }
  const matchedGroups1 = _.filter(appDictionaryGroupArrayLowerCase, (sub) =>
    lowerRawZone1.indexOf(sub) >= 0);
  const matchedGroups2 = _.filter(appDictionaryGroupArrayLowerCase, (sub) =>
    lowerRawZone2.indexOf(sub) >= 0);
  const matchedGroups = matchedGroups1.concat(matchedGroups2).filter((x) => x !== undefined || x !== '');
  console.log(`matcherZone.multi - matchedGroups: ${matchedGroups}`);

  const matchedZones1 = _.filter(appDictionaryArrayLowerCase, (sub) =>
    lowerRawZone1.indexOf(sub) >= 0);
  const matchedZones2 = _.filter(appDictionaryArrayLowerCase, (sub) =>
    lowerRawZone2.indexOf(sub) >= 0);
  const matchedZones = matchedZones1.concat(matchedZones2).filter((x) => x !== undefined || x !== '');
  console.log(`matcherZone.multi - matchedZones: ${matchedZones}`);
  matchedZones.forEach((key) => {
    matchedZones[key] = didYouMean(key, appDictionaryArray);
  });
  matchedGroups.forEach((key) => {
    const matchedKeyGroup = didYouMean(key, appDictionaryGroupArray);
    matchedKeyGroups.push(...appDictionaryGroups[matchedKeyGroup]);
  });

  if (currentZone.actionable[0] === false && matchedGroups.length === 0 && matchedZones.length === 0) {
    console.log('matcherZone.multi - no zones found');
    a.sendError(`Multi Zone Match Fail: ${rawZone1} , ${rawZone2}`);
    defer.reject(voiceMessages.error.zoneNotFound);
  } else if (currentZone.actionable[0] !== false && matchedGroups.length === 0 && matchedZones.length === 0) {
    console.log(`currentZone.actionable: '${currentZone.actionable}'`);
    console.log(`currentZone.speakable: '${currentZone.speakable}'`);
    console.log('matcherZone.multi - Single zone mode');
    ret = currentZone;
    a.sendError(`Single zone mode: ${ret.actionable}`);
    defer.resolve(ret);
  } else {
    ret.actionable = _.uniq(matchedZones.concat(matchedKeyGroups));
    ret.speakable = _.uniq(matchedGroups.concat(matchedZones));
    ret.speakable = stringLib.addAnd(ret.speakable);
    console.log('matcherZone.multi ---------');
    console.log('matcherZone.multi - Zones to send commands to:');
    ret.actionable.forEach((key) => {
      console.log(`matcherZone.multi - zone ${key} : ${ret.actionable[key]}`);
    });
    console.log('matcherZone.multi ---------');
    console.log('matcherZone.multi - Zones to say:');
    ret.speakable.forEach((key) => {
      console.log(`matcherZone.multi - zone ${key} : ${ret.speakable[key]}`);
    });
    console.log('matcherZone.multi ---------');
    defer.resolve(ret);
  }
  a.sendTime('Matching', 'Multi');
  return defer.promise;
}


module.exports = {
  single,
  multi,
};