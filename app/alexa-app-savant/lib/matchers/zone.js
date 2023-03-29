const didYouMean = require('didyoumean');
const _ = require('lodash');
const q = require('q');
const stringLib = require('../stringLib');
const eventAnalytics = require('../eventAnalytics');
const voiceMessages = require('../voiceMessages.json');

function single(zoneIn, callback) {
  const analyticsEvent = new eventAnalytics.event();
  log.error('matcherZone.single - Matching requested zone...');
  log.info(`matcherZone.single - zoneIn: ${zoneIn}`);
  const editZone = zoneIn.replace(/the/ig, ''); // Remove the word "the" if it exists
  const cleanZone = didYouMean(editZone, appDictionaryArray);

  if (!cleanZone) { // no match
    analyticsEvent.sendError(`Single Zone Match Fail: ${zoneIn}`);
    callback(voiceMessages.error.zoneNotFound, undefined);
  } else { // match
    analyticsEvent.sendTime('Matching', 'Single');
    callback(undefined, cleanZone);
  }
}

function multi(rawZone1 = '', rawZone2 = '') {
  const analyticsEvent = new eventAnalytics.event();
  const matchedKeyGroups = [];
  const result = {};
  log.error('matcherZone.multi - Matching requested zones...');
  const defer = q.defer();

  log.info(`matcherZone.multi - slot 1: ${rawZone1}`);
  log.info(`matcherZone.multi - slot 2: ${rawZone2}`);

  // Sanitize input
  const lowerRawZone1 = _.toLower(rawZone1);
  const lowerRawZone2 = _.toLower(rawZone2);
  const hasFirst = appDictionaryGroupArrayLowerCase.some(item => item.includes('1st'));

  const sanitizeZone = rawZone => hasFirst ? rawZone.replace(/1st/ig, 'first') : rawZone;
  const sanitizedZone1 = sanitizeZone(lowerRawZone1);
  const sanitizedZone2 = sanitizeZone(lowerRawZone2);

  const getMatchedGroups = rawZone => _.filter(appDictionaryGroupArrayLowerCase, sub => rawZone.includes(sub));
  const getMatchedZones = rawZone => _.filter(appDictionaryArrayLowerCase, sub => rawZone.includes(sub));

  const matchedGroups = getMatchedGroups(sanitizedZone1).concat(getMatchedGroups(sanitizedZone2));
  const matchedZones = getMatchedZones(sanitizedZone1).concat(getMatchedZones(sanitizedZone2));

  // Match Zones to savant case
  matchedZones.forEach((zone, key) => {
    matchedZones[key] = didYouMean(zone, appDictionaryArray)
  });

  // Get Group's zones, matched to savant's case
  matchedKeyGroups.length = 0;
  for (const key in matchedGroups) {
    const matchedKeyGroup = didYouMean(matchedGroups[key], appDictionaryGroupArray);
    for (const key2 in appDictionaryGroups[matchedKeyGroup]) {
      matchedKeyGroups.push(appDictionaryGroups[matchedKeyGroup][key2]);
    }
  }

  if (!currentZone.actionable[0] && matchedGroups.length === 0 && matchedZones.length === 0) {
    log.error('matcherZone.multi - no zones found');
    analyticsEvent.sendError(`Multi Zone Match Fail: ${rawZone1}, ${rawZone2}`);
    defer.reject(voiceMessages.error.zoneNotFound);
  } else if (currentZone.actionable[0] && matchedGroups.length === 0 && matchedZones.length === 0) {
    log.error(`currentZone.actionable: '${currentZone.actionable}'`);
    log.error(`currentZone.speakable: '${currentZone.speakable}'`);

    log.error('matcherZone.multi - Single zone mode');
    result.actionable = currentZone.actionable;
    result.speakable = currentZone.speakable;
    analyticsEvent.sendError(`Single zone mode: ${result.actionable}`);
    defer.resolve(result);
  } else {
    result.actionable = _.uniq(matchedZones.concat(matchedKeyGroups));
    result.speakable = _.uniq(matchedGroups.concat(matchedZones));
    result.speakable = stringLib.addAnd(result.speakable);

    log.info('matcherZone.multi ---------');
    log.info('matcherZone.multi - Zones to send commands to:');
    for (const key in result.actionable) {
      log.info(`matcherZone.multi - zone ${key}: ${result.actionable[key]}`);
    }
    log.info('matcherZone.multi ---------');
    log.info('matcherZone.multi - Zones to say:');
    for (const key in result.speakable) {
      log.info(`matcherZone.multi - zone ${key}: ${result.speakable[key]}`);
    }
    log.info('matcherZone.multi ---------');
    defer.resolve(result);
  }
  analyticsEvent.sendTime('Matching', 'Multi');
  return defer.promise;
}

module.exports = {
  single,
  multi,
}