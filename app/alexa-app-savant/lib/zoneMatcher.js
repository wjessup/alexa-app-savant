var didYouMean = require('didyoumean');
var _ = require('lodash');

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
  // Set raw input to '' if empty
  if (!rawZone1){
    var rawZone1 = '';
  }
  if (!rawZone2){
    var rawZone2 = '';
  }

  lowerrawZone1 = _.toLower(rawZone1);
  lowerrawZone2 = _.toLower(rawZone2);
  //what are we getting from the intent?
  //console.log ("Lower case raw zone1: "+ lowerrawZone1);
  //console.log ("Lower case raw zone2: "+ lowerrawZone2);
  //console.log ("looking in: "+appDictionaryArrayLowerCase);

  //find matches from either slot
  var cleanZones1 = _.filter(appDictionaryArrayLowerCase, function(sub) { return lowerrawZone1.indexOf(sub) >= 0; });
  //console.log(cleanZones1);
  var cleanZones2 = _.filter(appDictionaryArrayLowerCase, function(sub) { return lowerrawZone2.indexOf(sub) >= 0; });
  //console.log(cleanZones2);
  //join the two slots together
  var cleanZones = cleanZones1.concat(cleanZones2);

  //fail off if we didnt get a match
  if (cleanZones.length === 0){
    var err = 'I didnt understand which zone you wanted, please try again.';
    callback(err,undefined);
  }

  // match savant case
  for (var key in cleanZones){
    cleanZones[key] = didYouMean(cleanZones[key],appDictionaryArray);
  }

  //what did we find?
  console.log ("zone1: "+ cleanZones[0]);
  console.log ("zone2: "+ cleanZones[1]);
  console.log ("zone3: "+ cleanZones[2]);
  console.log ("zone4: "+ cleanZones[3]);

  return(cleanZones);
}

module.exports = {
zoneMatcher : zoneMatcher,
zonesMatcher : zonesMatcher
}
