module.change_code = 1;
module.exports = function(app,callback){
  var intentArray = [
    intentName = 'raiseVolume',
    intentVersion = '1.0',
    intentDescription = 'Increase volume for AV zone by a preset ammount'
  ];

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
  callback(intentArray);
};
