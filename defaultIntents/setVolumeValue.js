//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../zoneParse');
var savantLib = require('../savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'setVolumeValue',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set volume for AV zone in percentage',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('setVolumeValue', {
    		"slots":{"VOLUMEVALUE":"NUMBER","ZONE":"LITERAL"}
    		,"utterances":["{actionPrompt} volume in {systemZones|ZONE} to {0-100|VOLUMEVALUE} {percent |}","{actionPrompt} {systemZones|ZONE} volume to {0-100|VOLUMEVALUE} {percent |}"]
    	},function(req,res) {
    		//fix volume scale
    		console.log("Raw Volume request: "+req.slot('VOLUMEVALUE'))
    		var volumeValue = Math.round(req.slot('VOLUMEVALUE')/2);

    		//make a list of zones and make sure it matches request
    		zoneParse.getZones(zoneInfo, function (err, foundZones) {
    			var ZoneName = didYouMean(req.slot('ZONE'), foundZones);

    		//Set Volume
    		console.log ("Setting volume to "+volumeValue+" in "+ ZoneName);
    		if (volumeValue == undefined && ZoneName == undefined && volumeValue > 0 && volumeValue<101){
    			res.say("I didnt understand please try again").send();
    		} else{
    			savantLib.serviceRequest([ZoneName],"volume","",[volumeValue]);
    			res.say("Setting volume to "+req.slot('VOLUMEVALUE')+" in "+ ZoneName).send();
    		}

    		});
    	return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
