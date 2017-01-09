const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {//Intent meta information
    'intentName' : 'setVolumeValue',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set volume for AV zone in percentage',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('setVolumeValue', {
    		"slots":{"VOLUMEVALUE":"NUMBER","ZONE":"ZONE"}
    		,"utterances":["{actionPrompt} volume in {-|ZONE} to {0-100|VOLUMEVALUE} {percent |}","{actionPrompt} {-|ZONE} volume to {0-100|VOLUMEVALUE} {percent |}"]
    	}, function(req,res) {
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          action.setVolume(cleanZones, Number(req.slot('VOLUMEVALUE')))//Set volume to requested value in all cleanZones
          return cleanZones
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Setting volume to ' + req.slot('VOLUMEVALUE') + ' in ' + cleanZones[1];
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
