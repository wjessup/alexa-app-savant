const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics'),
  fs = require('fs'),
  path = require('path'),
  plist = require('simple-plist'),
  savantLib = require('../lib/savantLib'),
  stringLib = require('../lib/stringLib');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {//Intent meta information
    'intentName' : 'setVolumePreset',
    'intentVersion' : '2.0',
    'intentDescription' : 'Set volume Preset for AV zone with current value',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('setVolumePreset', {
    		"slots":{"ZONE":"ZONE","RANGE":"RANGE"}
    		,"utterances":["save current volume to {preset |} {-|RANGE} in {-|ZONE}"]
    	}, function(req,res) {
        matcher.zonesMatcher(req.slot('ZONE'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          var requestedZone = cleanZones[0][0];
          return stringLib.cleanRange(req.slot('RANGE'))
          .then(function (requestedRange) {
            savantLib.readState(requestedZone+'.CurrentVolume', function(currentVolume) {
              userPresets.volume[requestedZone][requestedRange] = currentVolume;
              var userPresetsFile = path.resolve(__dirname,'../userFiles/userPresets.plist');
              if (fs.existsSync(userPresetsFile)) {
                console.log("Writing user preset");
                plist.writeFileSync(userPresetsFile, userPresets);
              }
              eventAnalytics.send(intentDictionary.intentName,cleanZones,"alexa","setVolumePreset",requestedRange,currentVolume);
            });
          })
          .thenResolve(cleanZones);
        })
        .then(function(cleanZones) {//Inform

          var voiceMessage = 'Saving volume preset '+req.slot('RANGE')+' in ' + cleanZones[1];
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
