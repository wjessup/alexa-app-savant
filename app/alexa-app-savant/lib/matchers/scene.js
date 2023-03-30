const didYouMean = require('didyoumean');
const _ = require('lodash');
const q = require('q');
const stringLib = require('../stringLib');
const eventAnalytics = require('../eventAnalytics');
const voiceMessages = require('../voiceMessages.json');

module.exports = {
  single: single,
  multi: multi
};

function single(zoneIn, callback) {
  const a = new eventAnalytics.event();
  console.log("matcherZone.single - Matching requested zone...");
  console.log("matcherZone.single - zoneIn: " + zoneIn);

  const editZone = zoneIn.replace(/the/ig, "");
  const cleanZone = didYouMean(editZone, appDictionaryArray);

  if (!cleanZone) {
    a.sendError("Single Zone Match Fail: " + zoneIn);
    return callback(voiceMessages.error.zoneNotFound, undefined);
  } else {
    a.sendTime("Matching", "Single");
    return callback(undefined, cleanZone);
  }
}

function multi(rawZone1, rawZone2) {
  const a = new eventAnalytics.event();
  const ret = {};
  console.log("matcherZone.multi - Matching requested zones...");

  let defer = q.defer();

  if (!rawZone1) {
    rawZone1 = '';
  }

  if (!rawZone2) {
    rawZone2 = '';
  }

  console.log("matcherZone.multi - slot 1: " + rawZone1);
  console.log("matcherZone.multi - slot 2: " + rawZone2);

  let lowerrawZone1 = _.toLower(rawZone1);
  let lowerrawZone2 = _.toLower(rawZone2);

  const hasFirst = appDictionaryGroupArrayLowerCase.filter(
    (item) => item.indexOf('1st') >= 0
  );

  if (hasFirst) {
    lowerrawZone1 = lowerrawZone1.replace(/1st/ig, "first");
    lowerrawZone2 = lowerrawZone2.replace(/1st/ig, "first");
  }

  const matchedGroups1 = _.filter(appDictionaryGroupArrayLowerCase,
    function (sub) {
      return lowerrawZone1.includes(sub);
    });
  const matchedGroups2 = _.filter(appDictionaryGroupArrayLowerCase,
    function (sub) {
      return lowerrawZone2.includes(sub);
    });
  const matchedGroups = matchedGroups1.concat(matchedGroups2).filter((x) => x !== (undefined || ''));

  console.log("matcherZone.multi - matchedGroups: " + matchedGroups);

  const matchedZones1 = _.filter(appDictionaryArrayLowerCase, function (
    sub) {
    return lowerrawZone1.includes(sub);
  });

  const matchedZones2 = _.filter(appDictionaryArrayLowerCase, function (
    sub) {
    return lowerrawZone2.includes(sub);
  });

  const matchedZones = matchedZones1.concat(matchedZones2).filter((x) => x !== (undefined || ''));

  console.log("matcherZone.multi - matchedZones: " + matchedZones);

  for (let key in matchedZones) {
    matchedZones[key] = didYouMean(matchedZones[key], appDictionaryArray);
  }

  const matchedKeyGroups = [];

  for (let key in matchedGroups) {
    const matchedKeyGroup = didYouMean(matchedGroups[key], appDictionaryGroupArray);
    for (let key2 in appDictionaryGroups[matchedKeyGroup]) {
      matchedKeyGroups.push(appDictionaryGroups[matchedKeyGroup][key2]);
    }
  }

  if (!currentZone.actionable[0] && matchedGroups.length === 0 && matchedZones.length === 0) {
    console.log("matcherZone.multi - no zones found");
    a.sendError("Multi Zone Match Fail: " + rawZone1 + " , " + rawZone2);
    defer.reject(voiceMessages.error.zoneNotFound);
  } else if (currentZone.actionable[0] && matchedGroups.length === 0 && matchedZones.length === 0) {
    console.log("currentZone.actionable: '" + currentZone.actionable + "'");
    console.log("currentZone.speakable: '" + currentZone.speakable + "'");
    console.log("matcherZone.multi - Single zone mode");

    ret = currentZone;
    a.sendError("Single zone mode: " + ret.actionable);
    defer.resolve(ret);
  } else {
    ret.actionable = _.uniq(matchedZones.concat(matchedKeyGroups));
    ret.speakable = _.uniq(matchedGroups.concat(matchedZones));
    ret.speakable = stringLib.addAnd(ret.speakable);

    console.log("matcherZone.multi ---------");
    console.log("matcherZone.multi - Zones to send commands to:");

    let key;
    for (key in ret.actionable) {
      console.log('matcherZone.multi - zone ' + key + ': ' + ret.actionable[key]);
    }

    console.log("matcherZone.multi ---------");
    console.log("matcherZone.multi - Zones to say:");

    for (key in ret.speakable) {
      console.log('matcherZone.multi - zone ' +key + ': ' + ret.speakable[key]);
    }

    console.log("matcherZone.multi ---------");
    defer.resolve(ret);
  }

  a.sendTime("Matching", "Multi");
  return defer.promise;
}