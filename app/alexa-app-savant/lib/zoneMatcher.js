var didYouMean = require('didyoumean');

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

module.exports = {
zoneMatcher: zoneMatcher
}
