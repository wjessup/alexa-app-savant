const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  serviceMatcher = require('../lib/serviceMatcher'),
  eventAnalytics = require('../lib/eventAnalytics');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'startService',
    'intentVersion' : '2.0',
    'intentDescription' : 'Turn on any service in any AV zone',
    'intentEnabled' : 1,
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('startService', {
    		"slots":{"SERVICE":"SERVICE","ZONE":"ZONE","ZONE_TWO":"ZONE_TWO"}
    		,"utterances":[
          "{enablePrompt} {-|SERVICE} in {the |} {-|ZONE}",
          "{enablePrompt} {-|SERVICE} in {the |} {-|ZONE} and {-|ZONE_TWO}",
          "{enablePrompt} {-|ZONE} to {-|SERVICE}",
          "{enablePrompt} {-|ZONE} and {-|ZONE_TWO} to {-|SERVICE}"
        ]
    	}, function(req,res) {
        var a = new eventAnalytics.event(intentDictionary.intentName);
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {//get services for requested zones and return service array for requested service
          var matchedServices = serviceMatcher.serviceMatcher(cleanZones,req.slot('SERVICE'));
          return matchedServices
        })
        .then(function(ret) {//send power command to all found service arrays
          return action.bulkPowerOn(ret.serviceArray)
          .thenResolve(ret.cleanZones);
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Turning on ' + req.slot('SERVICE') + ' in ' + cleanZones[1];
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
          a.sendAV([cleanZones,req.slot('SERVICE'),"PowerOn"]);
        })
        .fail(function(voiceMessage) {//Zone could not be found
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        });
    	return false;
      });


    }
  //Return intent meta info to index
  callback(intentDictionary);
};
