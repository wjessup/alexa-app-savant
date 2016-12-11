module.change_code = 1;
module.exports = function(app,callback){
  var intentArray = [
    intentName = 'powerOff',
    intentVersion = '1.0',
    intentDescription = 'Power off requested zone'
  ];

  app.intent('powerOff', {
  		"slots":{"ZONE":"LITERAL"}
  		,"utterances":["{actionPrompt} off {systemZones|ZONE}"]
  	},function(req,res) {
  		//get zone list and match to request
  		zoneParse.getZones(zoneInfo, function (err, foundZones) {
  			//console.log("Found the following zones: ");
  			//console.log(req.slot('ZONE'));
  			//console.log(foundZones);
  			cleanZone = didYouMean(req.slot('ZONE'), foundZones);
  			//console.log(cleanZone);
  			console.log('Power Off Intent: Turning Off '+cleanZone);
  			savantLib.serviceRequest([cleanZone,"PowerOff"],"zone");
  			res.say('Turning off '+cleanZone).send();
  		});
  		return false;
  	}
  );
  callback(intentArray);
};
