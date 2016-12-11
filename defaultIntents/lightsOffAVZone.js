var didYouMean = require('didYouMean');
var zoneParse = require('../zoneParse');
var savantLib = require('../savantLib');

module.change_code = 1;
module.exports = function(app,callback){
  var intentArray = [
    intentName = 'lightsOffAVZone',
    intentVersion = '1.0',
    intentDescription = 'Turn off lights in a defined AV zone using Savants __RoomSetBrightness workflow'
  ];

  app.intent('lightsOffAVZone', {
  		"slots":{"ZONE":"LITERAL"}
  		,"utterances":["{actionPrompt} off {systemZones|ZONE} lights","{actionPrompt} off lights in {systemZones|ZONE}"]
  	},function(req,res) {
  		//get zone list and match to request
  		zoneParse.getZones(zoneInfo, function (err, foundZones) {
  			//console.log("Found the following zones: ");
  			//console.log(req.slot('ZONE'));
  			//console.log(foundZones);
  			cleanZone = didYouMean(req.slot('ZONE'), foundZones);
  			//console.log(cleanZone);

  			console.log('Lights Off Intent: Turning off '+cleanZone+' lights');
  			savantLib.serviceRequest([cleanZone],"lighting","",[0]);
  			res.say('Turning off '+cleanZone+'lights').send();
  		});
  	return false;
  	}
  );
  callback(intentArray);
};
