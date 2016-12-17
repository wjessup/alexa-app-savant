//Intent includes
var matcher = require('../lib/zoneMatcher');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'lowerVolumeAlot',
    'intentVersion' : '1.0',
    'intentDescription' : 'Lower volume for AV zone by a large preset ammount',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('lowerVolumeAlot', {
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["{decreasePrompt} volume in {-|ZONE} a lot", "Make {-|ZONE} much lower","{-|ZONE} is too loud"]
    	},function(req,res) {
        //Match request to zone then do something
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
              res.say(voiceMessage).send();
              return
          }
    			savantLib.readState(cleanZone+'.CurrentVolume', function(currentVolume) {
            //adjust volume
            newVolume = Number(currentVolume)-20
            //set volume
            savantLib.serviceRequest([cleanZone],"volume","",[newVolume]);
            //inform
            var voiceMessage = 'Lowering volume a lot in '+ cleanZone;
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
    			});
        });
    	return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
