var didYouMean = require('didyoumean');
var stringLib = require('../lib/stringLib');
var _ = require('lodash');
var matchedKeyGroups=[];
var cleanZones = [];



function zoneMatcher(zoneIn,callback){
  //Remove the word the if it exists
  var editZone = zoneIn.replace(/the/ig,"");
  //Match request to zone list
  var cleanZone = didYouMean(editZone, appDictionaryArray);

  //make sure cleanZone exists
  if (typeof cleanZone == 'undefined' || cleanZone == null){
    //return error
    var err = 'I didnt understand which zone you wanted, please try again.';
    callback(err, undefined);
  }else{
    //return cleanZone
    callback(undefined, cleanZone);
  }
}

function zonesMatcher(rawZone1,rawZone2,callback){
  if (currentZone != false){
    //cleanzone[0] = zones to take action in
    cleanZones[0] = [currentZone];
    //cleanzone2 = what to tell user you are doing.  says group name not zone names
    cleanZones[1] = [currentZone];
    console.log("Single zone mode: "+cleanZones);
    console.log("");
    return(cleanZones);
  } else {
    // Set raw input to '' if empty
    if (!rawZone1){
      var rawZone1 = '';
    }
    if (!rawZone2){
      var rawZone2 = '';
    }

    console.log("Looking for: "+rawZone1+" and " +rawZone2);

    //sanitize input
    var lowerrawZone1 = rawZone1.replace(/1st/ig,"first");
    var lowerrawZone2 = rawZone2.replace(/1st/ig,"first");
    lowerrawZone1 = _.toLower(lowerrawZone1);
    lowerrawZone2 = _.toLower(lowerrawZone2);

    //find Group match from either slot, then concat
    var matchedGroups1 = _.filter(appDictionaryGroupArrayLowerCase, function(sub) { return lowerrawZone1.indexOf(sub) >= 0; });
    var matchedGroups2 = _.filter(appDictionaryGroupArrayLowerCase, function(sub) { return lowerrawZone2.indexOf(sub) >= 0; });
    var matchedGroups = matchedGroups1.concat(matchedGroups2);

    //find zone matches from either slot, then concat
    var matchedZones1 = _.filter(appDictionaryArrayLowerCase, function(sub) { return lowerrawZone1.indexOf(sub) >= 0; });
    var matchedZones2 = _.filter(appDictionaryArrayLowerCase, function(sub) { return lowerrawZone2.indexOf(sub) >= 0; });
    var matchedZones = matchedZones1.concat(matchedZones2);

    //fail off if we didnt get a match
    if (matchedGroups.length === 0 && matchedZones.length === 0){// && cleanGroups.length === 0){
      var err = 'I didnt understand which zone you wanted, please try again.';
      callback(err,undefined);
    }

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

    //cleanzone[0] = zones to take action in
    cleanZones[0] = matchedZones.concat(matchedKeyGroups);
    //cleanzone2 = what to tell user you are doing.  says group name not zone names
    cleanZones[1] = stringLib.addAnd(matchedGroups.concat(matchedZones));
    //what did we find?
    console.log("---------");
    console.log("Zones to send commands to:");
    console.log("zone1: "+ cleanZones[0][0]);
    console.log("zone2: "+ cleanZones[0][1]);
    console.log("zone3: "+ cleanZones[0][2]);
    console.log("zone4: "+ cleanZones[0][3]);
    console.log("---------");
    console.log("Zones to say:");
    console.log("zone1: "+ cleanZones[1][0]);
    console.log("zone2: "+ cleanZones[1][1]);
    console.log("zone3: "+ cleanZones[1][2]);
    console.log("zone4: "+ cleanZones[1][3]);
    console.log("---------");

    return(cleanZones);
  }
}

module.exports = {
zoneMatcher : zoneMatcher,
zonesMatcher : zonesMatcher
}
