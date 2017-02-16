const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'lowerVolume',
    'intentVersion' : '2.0',
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
        var a = new eventAnalytics.event(intentDictionary.intentName);
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          for (var key in cleanZones[0]){
            var requestedZone = cleanZones[0][key]
            savantLib.readState(requestedZone+'.RelativeVolumeOnly', function(RelativeVolumeOnly,stateIn) {
              var originalZone = stateIn.split(".");//parse original zone
              if (RelativeVolumeOnly === "0"){
                savantLib.readState(originalZone[0]+'.CurrentVolume', function(currentVolume,stateIn) {
                  var originalZone = stateIn.split(".");//parse original zone
                  var newVolume = Number(currentVolume)-6;//adjust volume
                  savantLib.serviceRequest([originalZone[0]],"volume","",[newVolume]);//set volume

                });
                console.log("setting two way volume in "+originalZone[0] )
                a.sendAV([cleanZones,"Zone","Adjust Volume",{"value":"Two Way, -6","type":"adjust"}]);
              }else{
                for (var i = 0; i < 10; i++){
                  savantLib.serviceRequest([originalZone[key],"VolumeDown"],"zone");
                }
                console.log("setting one way Volume in "+originalZone[0] )
                a.sendAV([cleanZones,"Zone","Adjust Volume",{"value":"One Way, -10","type":"adjust"}]);
              }
            });
          }
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
