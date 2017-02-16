const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {//Intent meta information
    'intentName' : 'raiseVolumeAlot',
    'intentVersion' : '2.0',
    'intentDescription' : 'Increase volume for AV zone by a large preset ammount',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    var a = new eventAnalytics.event(intentDictionary.intentName);
    app.intent('raiseVolumeAlot', {
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["{increasePrompt} volume in {-|ZONE} a lot", "Make {-|ZONE} much louder"]
    	}, function(req,res) {
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          return action.relativeVolume(cleanZones,20)//increase volume by 40% in cleanZones
          .thenResolve(cleanZones);
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Increasing volume alot in '+ cleanZones[1];
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
          a.sendAV([cleanZones,"Zone","Adjust Volume",{"value":"Two Way, 20","type":"adjust"}]);
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
