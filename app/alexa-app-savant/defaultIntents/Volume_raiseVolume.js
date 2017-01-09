const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'raiseVolume',
    'intentVersion' : '1.0',
    'intentDescription' : 'Increase volume for AV zone by a preset ammount',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('raiseVolume', {
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["{increasePrompt} volume in {-|ZONE}", "Make {-|ZONE} louder"]
    	}, function(req,res) {
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          action.relativeVolume(cleanZones,6)//increase volume by 12% in cleanZones
          return cleanZones
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Increasing volume in '+ cleanZones[1];
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
