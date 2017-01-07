//Intent includes
var matcher = require('../lib/zoneMatcher');
var action = require('../lib/actionLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'setVolumeRange',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set volume for AV zone with high med low presets',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('setVolumeRange', {
    		"slots":{"RANGE":"RANGE","ZONE":"ZONE"}
    		,"utterances":["set volume in {-|ZONE} {to |} {-|RANGE}","set {-|ZONE} volume {to |} {-|RANGE}"]
    	},function(req,res) {
        //Get clean zones, fail if we cant find a match
        var cleanZones = matcher.zonesMatcher(req.slot('ZONE'),req.slot('ZONE_TWO'), function (err,cleanZones){
          voiceMessage = err;
          voiceMessageNote = "(Invalid Zone Match, cleanZones: "+cleanZones+")";
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ("+voiceMessageNote+")");
          res.say(voiceMessage).send();
        });
        if (cleanZones[0].length === 0){
          return
        }

        //Set Volume by range in all cleanZones
        action.setVolume(cleanZones[0],req.slot('RANGE'), function (err){
          if (err){
            console.log (intentDictionary.intentName+' Intent: '+err+" Note: ()");
            res.say(err).send();
            return
          }
        });

        //inform
        var voiceMessage = 'Setting volume to '+req.slot('RANGE')+' in '+ cleanZone[1];
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
    	  return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
