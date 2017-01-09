const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'sleepDisarm',
    'intentVersion' : '1.0',
    'intentDescription' : 'Stop a sleep timer in a zone',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('sleepDisarm', {
        "slots":{"ZONE":"ZONE"}
        ,"utterances":["{Stop|disable} {sleep |} timer in {-|ZONE}"]
      }, function(req,res) {
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          action.sleepTimer(cleanZones,"disarm")//Disable Sleep timer in cleanZones
          return cleanZones
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Disabling timer in '+cleanZones[1];
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        })
        .fail(function(voiceMessage) {//Zone could not be found
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        });
      return false;
      }
    );
  }
  callback(intentDictionary);
};
