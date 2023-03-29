const didYouMean = require('didyoumean');
const _ = require('lodash');
const q = require('q');
const stringLib = require('../stringLib');
const eventAnalytics = require('../eventAnalytics');
const voiceMessages = require('../voiceMessages.json');

function replace1stWithFirst(text) {
  return text.replace(/1st/ig, 'first');
}

function removeTheFromText(text) {
  return text.replace(/the/ig, '');
}

function sanitizeInput(text) {
  return replace1stWithFirst(_.toLower(text));
}

function single(zoneIn, callback) {
  const event = new eventAnalytics.event();
  log.error('matcherZone.single -  Matching requested zone...');
  log.info('matcherZone.single -  zoneIn: ' + zoneIn);
  const cleanZone = didYouMean(removeTheFromText(zoneIn), appDictionaryArray);

  if (!cleanZone) {
    event.sendError('Single Zone Match Fail: ' + zoneIn);
    callback(voiceMessages.error.zoneNotFound, undefined);
  } else {
    event.sendTime('Matching', 'Single');
    callback(undefined, cleanZone);
  }
}

function multi(rawZone1 = '', rawZone2 = '') {
  const event = new eventAnalytics.event();

  log.error('matcherZone.multi - Matching requested zones...');
  log.info('matcherZone.multi - slot 1: ' + rawZone1);
  log.info('matcherZone.multi - slot 2: ' + rawZone2);

  const sanitizedZone1 = sanitizeInput(rawZone1);
  const sanitizedZone2 = sanitizeInput(rawZone2);

  const matchedGroups = _.uniq([
    ..._.filter(appDictionaryGroupArrayLowerCase, (sub) => sanitizedZone1.includes(sub)),
    ..._.filter(appDictionaryGroupArrayLowerCase, (sub) => sanitizedZone2.includes(sub)),
  ]);

  const matchedZones = _.uniq([
    ..._.filter(appDictionaryArrayLowerCase, (sub) => sanitizedZone1.includes(sub)),
    ..._.filter(appDictionaryArrayLowerCase, (sub) => sanitizedZone2.includes(sub)),
  ]).map((zone) => didYouMean(zone, appDictionaryArray));

  const matchedKeyGroups = _.flatMap(matchedGroups, (group) => {
    const matchedGroup = didYouMean(group, appDictionaryGroupArray);
    return appDictionaryGroups[matchedGroup];
  });

  const defer = q.defer();

  if (
    currentZone.actionable[0] === false
    && matchedGroups.length === 0
    && matchedZones.length === 0
  ) {
    log.error('matcherZone.multi - no zones found');
    event.sendError('Multi Zone Match Fail: ' + rawZone1 + ' , ' + rawZone2);
    defer.reject(voiceMessages.error.zoneNotFound);
  } else if (
    currentZone.actionable[0] !== false
    && matchedGroups.length === 0
    && matchedZones.length === 0
  ) {
    log.error('currentZone.actionable: \'' + currentZone.actionable + '\'');
    log.error('currentZone.speakable: \'' + currentZone.speakable + '\'');

    log.error('matcherZone.multi - Single zone mode');
    event.sendError('Single zone mode: ' + currentZone.actionable);
    defer.resolve(currentZone);
  } else {
    const ret = {
      actionable: _.uniq([...matchedZones, ...matchedKeyGroups]),
      speakable: stringLib.addAnd(_.uniq([...matchedGroups, ...matchedZones])),
    };

    log.info('matcherZone.multi - Zones to send commands to:');
    ret.actionable.forEach((zone, index) => {
      log.info('matcherZone.multi - zone ' + index + ': ' + zone);
    });

    log.info('matcherZone.multi - Zones to say:');
    ret.speakable.forEach((zone, index) => {
      log.info('matcherZone.multi - zone ' + index + ': ' + zone);
    });

    defer.resolve(ret);
  }
  event.sendTime('Matching', 'Multi');
  return defer.promise;
}

module.exports = {
  single,
  multi,
};