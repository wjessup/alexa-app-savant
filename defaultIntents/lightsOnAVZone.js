module.change_code = 1;
module.exports = function(app,callback){
  var intentArray = [
    intentName = 'lightsOnAVZone',
    intentVersion = '1.0',
    intentDescription = 'Turn on lights in a defined AV zone using Savants __RoomSetBrightness workflow'
  ];

  app.intent('lightsOnAVZone', {
  		"slots":{"ZONE":"LITERAL"}
  		,"utterances":["{actionPrompt} on {systemZones|ZONE} lights","{actionPrompt} on lights in {systemZones|ZONE}"]
  	},function(req,res) {
  		//get zone list and match to request
  		zoneParse.getZones(zoneInfo, function (err, foundZones) {
  			//console.log("Found the following zones: ");
  			//console.log(req.slot('ZONE'));
  			//console.log(foundZones);
  			cleanZone = didYouMean(req.slot('ZONE'), foundZones);
  			//console.log(cleanZone);

  			console.log('Lights On Intent: Turning on '+cleanZone+' lights');
  			savantLib.serviceRequest([cleanZone],"lighting","",[100]);
  			res.say('Turning on '+cleanZone+'lights').send();
  		});
  		return false;
  	}
  );
  callback(intentArray);
};
