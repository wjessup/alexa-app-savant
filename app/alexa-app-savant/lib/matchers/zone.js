const
  didYouMean = require('didyoumean'),
  _ = require('lodash'),
  q = require('q'),
  stringLib = require('../stringLib'),
  eventAnalytics = require('../eventAnalytics'),
  voiceMessages = require('../voiceMessages.json');

function single(zoneIn,callback){
  var a = new eventAnalytics.event();
  log.error("matcherZone.single -  Matching requested zone...");
  log.info("matcherZone.single -  zoneIn: "+zoneIn);
  var editZone = zoneIn.replace(/the/ig,"");//Remove the word "the" if it exists
  var cleanZone = didYouMean(editZone, appDictionaryArray);
  if (typeof cleanZone == 'undefined' || cleanZone == null){// no match
    a.sendError("Single Zone Match Fail: "+zoneIn);
    callback(voiceMessages.error.zoneNotFound, undefined);
  }else{// match
    a.sendTime("Matching","Single");
    callback(undefined, cleanZone);
  }
}

function multi(rawZone1,rawZone2){
  var a = new eventAnalytics.event();
  var matchedKeyGroups=[];
  var ret = {};
  log.error("matcherZone.multi - Matching requested zones...");
  var defer = q.defer();
  // Set raw input to '' if empty
  if (!rawZone1){ var rawZone1 = '' }
  if (!rawZone2){ var rawZone2 = '' }
  log.info("matcherZone.multi - slot 1: "+rawZone1);
  log.info("matcherZone.multi - slot 2: "+rawZone2);
  //sanitize input
  var lowerrawZone1 = _.toLower(rawZone1);
  var lowerrawZone2 = _.toLower(rawZone2);
  var hasFirst = appDictionaryGroupArrayLowerCase.filter(function (item) {
    return item.indexOf('1st') >= 0;
  });
  if (hasFirst){
    lowerrawZone1 = lowerrawZone1.replace(/1st/ig,"first");
    lowerrawZone2 = lowerrawZone2.replace(/1st/ig,"first");
  }
  //find Group match from either slot, then concat
  var matchedGroups1 = _.filter(appDictionaryGroupArrayLowerCase, function(sub) { return lowerrawZone1.indexOf(sub) >= 0; });
  var matchedGroups2 = _.filter(appDictionaryGroupArrayLowerCase, function(sub) { return lowerrawZone2.indexOf(sub) >= 0; });
  var matchedGroups = matchedGroups1.concat(matchedGroups2);
  matchedGroups = matchedGroups.filter(function(x){//remove empty
    return (x !== (undefined || ''));
  });
  log.info("matcherZone.multi - matchedGroups: "+matchedGroups);
  //find zone matches from either slot, then concat
  var matchedZones1 = _.filter(appDictionaryArrayLowerCase, function(sub) { return lowerrawZone1.indexOf(sub) >= 0; });
  var matchedZones2 = _.filter(appDictionaryArrayLowerCase, function(sub) { return lowerrawZone2.indexOf(sub) >= 0; });
  var matchedZones = matchedZones1.concat(matchedZones2);
  matchedZones = matchedZones.filter(function(x){//remove empty
    return (x !== (undefined || ''));
  });
  log.info("matcherZone.multi - matchedZones: "+matchedZones);

  // match Zones to savant case
  for (var key in matchedZones){
    matchedZones[key] = didYouMean(matchedZones[key],appDictionaryArray);
  };
  //Get Group's zones, matched to savant's case
  matchedKeyGroups.length = 0;
  for (var key in matchedGroups){
    var matchedKeyGroup = didYouMean(matchedGroups[key],appDictionaryGroupArray);
    for (var key2 in appDictionaryGroups[matchedKeyGroup]){
    matchedKeyGroups.push(appDictionaryGroups[matchedKeyGroup][key2]);
    }
  }

  if (currentZone === false && matchedGroups.length === 0 & matchedZones.length === 0){
    //fail off if we didnt get a match
      log.error("matcherZone.multi - no zones found");
      a.sendError("Multi Zone Match Fail: "+rawZone1+" , "+rawZone2);
      defer.reject(voiceMessages.error.zoneNotFound);
  }else if(currentZone != false && matchedGroups.length === 0 & matchedZones.length === 0){
    log.error("matcherZone.multi - Single zone mode");
    ret = currentZone;
    a.sendError("Single zone mode: "+ret.actionable);
    defer.resolve(ret);
  }else{
    ret.actionable = matchedZones.concat(matchedKeyGroups);
    ret.speakable = stringLib.addAnd(matchedGroups.concat(matchedZones));

    log.info("matcherZone.multi ---------");
    log.info("matcherZone.multi - Zones to send commands to:");
    for (var key in ret.actionable){
      log.info('matcherZone.multi - zone '+key+': '+ ret.actionable[key]);
    }
    log.info("matcherZone.multi ---------");
    log.info("matcherZone.multi - Zones to say:");
    for (var key in ret.speakable){
      log.info('matcherZone.multi - zone '+key+': '+ ret.speakable[key]);
    }
    log.info("matcherZone.multi ---------");
    defer.resolve(ret);
  }
  a.sendTime("Matching","Multi");
  return defer.promise;
}

module.exports = {
single : single,
multi : multi
}
