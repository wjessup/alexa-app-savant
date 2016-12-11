var didYouMean = require('didYouMean');
var zoneParse = require('../zoneParse');
var savantLib = require('../savantLib');

module.change_code = 1;
module.exports = function(app,callback){
  var intentArray = [
    intentName = 'lowerVolume',
    intentVersion = '1.0',
    intentDescription = 'Lower volume for AV zone by a preset ammount'
  ];

  app.intent('lowerVolume', {
  		"slots":{"ZONE":"LITERAL"}
  		,"utterances":["lower volume in {systemZones|ZONE}", "Make {systemZones|ZONE} lower"]
  	},function(req,res) {
  		//make a list of zones and make sure it matches request
  		zoneParse.getZones(zoneInfo, function (err, foundZones) {
  			var ZoneName = didYouMean(req.slot('ZONE'), foundZones);

  			savantLib.readState(ZoneName+'.CurrentVolume', function(currentVolume) {
  				newVolume = Number(currentVolume)-6
  				savantLib.serviceRequest([ZoneName],"volume","",[newVolume]);
  				res.say("Lowering volume in "+ ZoneName).send();
  			});
  		});
  	return false;
  	}
  );

  callback(intentArray);
};
