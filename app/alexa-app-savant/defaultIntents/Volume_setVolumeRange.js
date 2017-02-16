const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {//Intent meta information
    'intentName' : 'setVolumeRange',
    'intentVersion' : '2.0',
    'intentDescription' : 'Set volume for AV zone with high med low presets',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('setVolumeRange', {
    		"slots":{"RANGE":"RANGE","ZONE":"ZONE"}
    		,"utterances":["set volume in {-|ZONE} {to |} {-|RANGE}","set {-|ZONE} volume {to |} {-|RANGE}"]
    	}, function(req,res) {
        var a = new eventAnalytics.event(intentDictionary.intentName);
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          if (typeof(req.slot('RANGE')) != "undefined"){
            return action.setVolume(cleanZones, req.slot('RANGE'),'range')//Set volume to requested range in all cleanZones
            .thenResolve(cleanZones);
          }else {
            var err = 'I didnt understand please try again. Say High,Medium,or Low';
            throw err
          }
        })
        .then(function(cleanZones) {//Inform
          var voiceMessage = 'Setting volume to ' + req.slot('RANGE') + ' in ' + cleanZones[1];
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
          a.sendAV([cleanZones,"Zone","SetVolume",{"value":req.slot('RANGE'),"type":"set"}]);
        })
        .fail(function(voiceMessage) {//Zone could not be found or range could not be matched
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        });
      return false;
      }
    );
  }
  callback(intentDictionary);
};
