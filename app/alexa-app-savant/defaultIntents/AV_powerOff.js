//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'powerOff',
    'intentVersion' : '1.0',
    'intentDescription' : 'Power off requested zone',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
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
  }
//Return intent meta info to index
  callback(intentDictionary);
};
