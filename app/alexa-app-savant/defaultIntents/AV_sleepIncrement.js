const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'sleepIncrement',
    'intentVersion' : '2.0',
    'intentDescription' : 'Start a sleep timer with a variable ammount',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('sleepIncrement', {
        "slots":{"TIMER":"NUMBER","ZONE":"ZONE"}
        ,"utterances":["add {1-120|TIMER} minutes to {sleep |} timer in {-|ZONE}"]
      }, function(req,res) {
        var a = new eventAnalytics.event(intentDictionary.intentName);
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          return action.sleepTimer(cleanZones,req.slot('TIMER'),"increment")//Add time to timer by requested ammount in cleanZones
          .thenResolve(cleanZones);
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Adding '+req.slot('TIMER')+' more minutes in '+cleanZones[1];
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
          a.sendSleep([cleanZones,"dis_sleepIncrement",req.slot('TIMER')]);
        })
        .fail(function(voiceMessage) {//Zone could not be found or Percent was out of range
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        });
      return false;
      }
    );
  }
  callback(intentDictionary);
};
