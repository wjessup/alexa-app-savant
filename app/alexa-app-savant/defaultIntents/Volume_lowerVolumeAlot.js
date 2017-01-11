const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'lowerVolumeAlot',
    'intentVersion' : '2.0',
    'intentDescription' : 'Lower volume for AV zone by a large preset ammount',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('lowerVolumeAlot', {
    		"slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO"}
    		,"utterances":[
          "{decreasePrompt} volume in {-|ZONE} a lot", "Make {-|ZONE} much lower","{-|ZONE} is too loud",
          "{decreasePrompt} volume in {-|ZONE} and {-|ZONE_TWO} a lot", "Make {-|ZONE} and {-|ZONE_TWO} much lower","{-|ZONE} and {-|ZONE_TWO} {is|are} too loud"
        ]
    	}, function(req,res) {
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          return action.relativeVolume(cleanZones,-20)//Decrease volume by 40% in cleanZones
          .thenResolve(cleanZones);
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Lowering volume alot in '+ cleanZones[1];
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
