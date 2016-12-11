//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../zoneParse');
var savantLib = require('../savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'raiseVolume',
    'intentVersion' : '1.0',
    'intentDescription' : 'Increase volume for AV zone by a preset ammount',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('raiseVolume', {
    		"slots":{"ZONE":"LITERAL"}
    		,"utterances":["raise volume in {systemZones|ZONE}", "Make {systemZones|ZONE} louder"]
    	},function(req,res) {
    		//make a list of zones and make sure it matches request
    		zoneParse.getZones(zoneInfo, function (err, foundZones) {
    			var ZoneName = didYouMean(req.slot('ZONE'), foundZones);

    			savantLib.readState(ZoneName+'.CurrentVolume', function(currentVolume) {
    				newVolume = Number(currentVolume)+6
    				savantLib.serviceRequest([ZoneName],"volume","",[newVolume]);
    				res.say("Increasing volume in "+ ZoneName).send();
    			});
    		});
    	return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
