//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
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
    		"slots":{"ZONE":"LITERAL"}
    		,"utterances":["lower volume in {systemZones|ZONE} a lot", "Make {systemZones|ZONE} much lower"]
    	},function(req,res) {
    		//make a list of zones and make sure it matches request
    		zoneParse.getZones(zoneInfo, function (err, foundZones) {
    			var ZoneName = didYouMean(req.slot('ZONE'), foundZones);

    			savantLib.readState(ZoneName+'.CurrentVolume', function(currentVolume) {
    				newVolume = Number(currentVolume)-20
    				savantLib.serviceRequest([ZoneName],"volume","",[newVolume]);
    				res.say("Lowering volume a lot in "+ ZoneName).send();
    			});
    		});
    	return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
