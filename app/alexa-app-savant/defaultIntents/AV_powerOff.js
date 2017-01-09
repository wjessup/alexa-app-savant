const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'powerOff',
    'intentVersion' : '1.0',
    'intentDescription' : 'Power off requested zone AV or lighting (lights in a defined AV zone using Savants __RoomSetBrightness workflow)',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('powerOff', {
    		"slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO","LIGHTING":"LIGHTING"}
    		,"utterances":[
          "{actionPrompt} off",
          "{actionPrompt} off {-|ZONE}","{actionPrompt} {-|ZONE} off","{actionPrompt} {-|ZONE} and {-|ZONE_TWO} off",
          "{actionPrompt} off {-|LIGHTING}",
          "{actionPrompt} off {-|ZONE} {-|LIGHTING}","{actionPrompt} off {-|ZONE} and {-|ZONE_TWO} {-|LIGHTING}",
          "{actionPrompt} {-|LIGHTING} off in {-|ZONE}","{actionPrompt} {-|LIGHTING} off in {-|ZONE} and {-|ZONE_TWO}"
        ]
    	},function(req,res) {
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          if (req.slot('LIGHTING')){ //if lighting lights or light was heard, run lighting worklow
            action.setLighting(cleanZones[0],0);
            return ('Turning off lights in '+ cleanZones[1])

          }else{ // Do AV action (Lighting was not heard)
            action.powerOffAV(cleanZones[0]);
            return ('Turning off '+cleanZones[1]);
          }
        })
        .then(function(voiceMessage) {//Inform
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
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
