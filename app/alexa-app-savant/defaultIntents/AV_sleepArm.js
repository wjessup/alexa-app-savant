const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'sleepArm',
    'intentVersion' : '2.0',
    'intentDescription' : 'Start a sleep timer with a variable ammount',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('sleepArm', {
        "slots":{"TIMER":"NUMBER","ZONE":"ZONE"}
        ,"utterances":["{actionPrompt} sleep timer for {1-120|TIMER} minutes in {-|ZONE}","{actionPrompt} sleep timer in {-|ZONE} for {1-120|TIMER} minutes"]
      }, function(req,res) {
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          return action.sleepTimer(cleanZones,req.slot('TIMER'),"arm")//start timer by requested ammount in cleanZones
          .thenResolve(cleanZones);
        })
        .then(function(cleanZones) {//Inform
          eventAnalytics.send(intentDictionary.intentName,cleanZones,"Zone","dis_sleepArm",undefined,undefined,undefined,req.slot('TIMER'));
          var voiceMessage = 'Starting timer for '+req.slot('TIMER')+' minutes in '+cleanZones[1];
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        })
        .fail(function(voiceMessage) {//Zone could not be found or time was out of range
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        });
      return false;
      }
    );
  }
  callback(intentDictionary);
};
