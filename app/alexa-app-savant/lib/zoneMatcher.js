var didYouMean = require('didyoumean');
var stringLib = require('../lib/stringLib');
var _ = require('lodash');
var q = require('q');
var eventAnalytics = require('./eventAnalytics');
var matchedKeyGroups=[];
var cleanZones = [];



function zoneMatcher(zoneIn,callback){
  var a = new eventAnalytics.event();
  //Remove the word the if it exists
  var editZone = zoneIn.replace(/the/ig,"");
  //Match request to zone list
  var cleanZone = didYouMean(editZone, appDictionaryArray);

  //make sure cleanZone exists
  if (typeof cleanZone == 'undefined' || cleanZone == null){
    //return error
    var err = 'I didnt understand which zone you wanted, please try again.';
    a.sendError("zoneMatcher Fail: "+zoneIn);
    callback(err, undefined);
  }else{
    //return cleanZone
    a.sendTime(["Matching","zoneMatcher"]);
    callback(undefined, cleanZone);
  }
}

function zonesMatcher(rawZone1,rawZone2){
  var a = new eventAnalytics.event();
  var defer = q.defer();
  // Set raw input to '' if empty
  if (!rawZone1){
    var rawZone1 = '';
  }
  if (!rawZone2){
    var rawZone2 = '';
  }

  console.log("Looking for: "+rawZone1+" and " +rawZone2);

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
  console.log("matchedGroups: "+matchedGroups);
  //find zone matches from either slot, then concat
  var matchedZones1 = _.filter(appDictionaryArrayLowerCase, function(sub) { return lowerrawZone1.indexOf(sub) >= 0; });
  var matchedZones2 = _.filter(appDictionaryArrayLowerCase, function(sub) { return lowerrawZone2.indexOf(sub) >= 0; });
  var matchedZones = matchedZones1.concat(matchedZones2);
  matchedZones = matchedZones.filter(function(x){//remove empty
    return (x !== (undefined || ''));
  });
  console.log("matchedZones: "+matchedZones);

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
      console.log("no zones found");
      var err = 'I didnt understand which zone you wanted, please try again.';
      a.sendError("zonesMatcher Fail: "+rawZone1+" , "+rawZone2);
      defer.reject(err);
  }else if(currentZone != false && matchedGroups.length === 0 & matchedZones.length === 0){
    //cleanzone[0] = zones to take action in
    cleanZones[0] = [currentZone];
    //cleanzone2 = what to tell user you are doing.  says group name not zone names
    cleanZones[1] = [currentZone];
    console.log("Single zone mode: "+cleanZones);
    console.log("");
    defer.resolve(cleanZones);
  }else{
    //cleanzone[0] = zones to take action in
    cleanZones[0] = matchedZones.concat(matchedKeyGroups);
    //cleanzone2 = what to tell user you are doing.  says group name not zone names
    cleanZones[1] = stringLib.addAnd(matchedGroups.concat(matchedZones));
    //what did we find?
    console.log("---------");
    console.log("Zones to send commands to:");
    for (var key in cleanZones[0]){
      console.log("zone "+key+": "+ cleanZones[0][key]);
    }
    console.log("---------");
    console.log("Zones to say:");
    for (var key in cleanZones[1]){
      console.log("zone "+key+": "+ cleanZones[1][key]);
    }
    console.log("---------");
    defer.resolve(cleanZones);
  }
  a.sendTime(["Matching","zonesMatcher"]);
  return defer.promise;
}

module.exports = {
zoneMatcher : zoneMatcher,
zonesMatcher : zonesMatcher
}
