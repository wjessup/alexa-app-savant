const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'lowerVolume',
    'intentVersion' : '1.0',
    'intentDescription' : 'Lower volume for AV zone by a preset ammount',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('lowerVolume', {
    		"slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO"}
    		,"utterances":[
          "{decreasePrompt} volume in {-|ZONE}", "Make {-|ZONE} lower",
          "{decreasePrompt} volume in {-|ZONE} and {-|ZONE_TWO}", "Make {-|ZONE} and {-|ZONE_TWO} lower"
        ]
    	}, function(req,res) {
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          action.relativeVolume(cleanZones,-6)//Decrease volume by 12% in cleanZones
          return cleanZones
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Lowering volume in '+ cleanZones[1];
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
