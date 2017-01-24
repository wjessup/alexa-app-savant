const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');


module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'primaryZoneDeclare',
    'intentVersion' : '1.0',
    'intentDescription' : 'tell alexa what zone you are in',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('primaryZoneDeclare', {
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["I am in {the |}{-|ZONE}","set {primry |} {location|zone} to {-|ZONE}"]
    	},function(req,res) {
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              var voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
              res.say(voiceMessage).send();
              return
          }
          var cleanZones = [];
          cleanZones[0] =[cleanZone];
          cleanZones[1] =[cleanZone];
          eventAnalytics.send(intentDictionary.intentName,cleanZones,"alexa");
          currentZone = cleanZone;
          savantLib.writeState("userDefined.currentZone",currentZone);
          var voiceMessage = "Setting location to "+currentZone;
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        });
    		return false;
    	}
    );
  }
  callback(intentDictionary);
};
