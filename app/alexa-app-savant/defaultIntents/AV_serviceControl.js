const didYouMean = require('didyoumean');
const _ = require('lodash');
const q = require('q');
const stringLib = require('../stringLib');
const eventAnalytics = require('../eventAnalytics');
const voiceMessages = require('../voiceMessages.json');

function single(zoneIn, callback) {
    const analyticsEvent = new eventAnalytics.event();
    log.error("matcherZone.single -  Matching requested zone...");
    log.info("matcherZone.single -  zoneIn: " + zoneIn);
    const editZone = zoneIn.replace(/the/ig, ""); // Remove the word "the" if it exists
    const cleanZone = didYouMean(editZone, appDictionaryArray);

    if (!cleanZone) { // no match
        analyticsEvent.sendError("Single Zone Match Fail: " + zoneIn);
        callback(voiceMessages.error.zoneNotFound, undefined);
    } else { // match
        analyticsEvent.sendTime("Matching", "Single");
        callback(undefined, cleanZone);
    }
}

function multi(rawZone1 = '', rawZone2 = '') {
    const analyticsEvent = new eventAnalytics.event();
    const matchedKeyGroups = [];
    let ret = {};
    log.error("matcherZone.multi - Matching requested zones...");
    const defer = q.defer();

    log.info("matcherZone.multi - slot 1: " + rawZone1);
    log.info("matcherZone.multi - slot 2: " + rawZone2);

    // Sanitize input
    const lowerRawZone1 = _.toLower(rawZone1);
    const lowerRawZone2 = _.toLower(rawZone2);
    const hasFirst = appDictionaryGroupArrayLowerCase.some(item => item.includes('1st'));

    if (hasFirst) {
        lowerRawZone1 = lowerRawZone1.replace(/1st/ig, "first");
        lowerRawZone2 = lowerRawZone2.replace(/1st/ig, "first");
    }

    const matchedGroups = findMatches(lowerRawZone1, lowerRawZone2, appDictionaryGroupArrayLowerCase);
    const matchedZones = findMatches(lowerRawZone1, lowerRawZone2, appDictionaryArrayLowerCase);

    log.info("matcherZone.multi - matchedGroups: " + matchedGroups);
    log.info("matcherZone.multi - matchedZones: " + matchedZones);

    // Match Zones to savant case
    matchedZones.forEach((zone, index) => {
        matchedZones[index] = didYouMean(zone, appDictionaryArray);
    });

    // Get Group's zones, matched to savant's case
    matchedKeyGroups.length = 0;
    for (const group of matchedGroups) {
        const matchedKeyGroup = didYouMean(group, appDictionaryGroupArray);
        for (const key in appDictionaryGroups[matchedKeyGroup]) {
            matchedKeyGroups.push(appDictionaryGroups[matchedKeyGroup][key]);
        }
    }

    const isActionableEmpty = currentZone.actionable[0] === false;
    const areGroupsAndZonesEmpty = matchedGroups.length === 0 && matchedZones.length === 0;

    if (isActionableEmpty && areGroupsAndZonesEmpty) {
        log.error("matcherZone.multi - no zones found");
        analyticsEvent.sendError("Multi Zone Match Fail: " + rawZone1 + " , " + rawZone2);
        defer.reject(voiceMessages.error.zoneNotFound);
    } else if (!isActionableEmpty && areGroupsAndZonesEmpty) {
        log.error("currentZone.actionable: '" + currentZone.actionable + "'");
        log.error("currentZone.speakable: '" + currentZone.speakable + "'");

        log.error("matcherZone.multi - Single zone mode");
        ret = currentZone;
        analyticsEvent.sendError("Single zone mode: " + ret.actionable);
        defer.resolve(ret);
    } else {
        ret.actionable = _.uniq([...matchedZones, ...matchedKeyGroups]);
        ret.speakable = _.uniq([...matchedGroups, ...matchedZones]);
        ret.speakable = stringLib.addAnd(ret.speakable);

        logMultiZoneInfo(ret);
        defer.resolve(ret);
    }

    analyticsEvent.sendTime("Matching", "Multi");
    return defer.promise;
}

function findMatches(input1, input2, dictionary) {
    const groupMatches1 = _.filter(dictionary, sub => input1.includes(sub));
    const groupMatches2 = _.filter(dictionary, sub => input2.includes(sub));
    return _.uniq([...groupMatches1, ...groupMatches2]).filter(x => x);
}

function logMultiZoneInfo(zoneInfo) {
    log.info("matcherZone.multi ---------");
    logMultiZones("matcherZone.multi - Zones to send commands to:", zoneInfo.actionable);
    log.info("matcherZone.multi ---------");
    logMultiZones("matcherZone.multi - Zones to say:", zoneInfo.speakable);
    log.info("matcherZone.multi ---------");
}

function logMultiZones(message, zones) {
    log.info(message);
    zones.forEach((zone, index) => {
        log.info(`matcherZone.multi - zone ${index}: ${zone}`);
    });
}

module.exports = {
    single: single,
    multi: multi
}