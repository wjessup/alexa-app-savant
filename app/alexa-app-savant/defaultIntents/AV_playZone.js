//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'playZone',
    'intentVersion' : '1.0',
    'intentDescription' : 'Send play to requested zone',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('playZone', {
    		"slots":{"ZONE":"LITERAL"}
    		,"utterances":["{to |} play {in |} {systemZones|ZONE}","{systemZones|ZONE} play"]
    	},function(req,res) {
          //get zone list and match to request
    		zoneParse.getZones(zoneInfo, function (err, foundZones) {
    			//console.log("Found the following zones: ");
    			//console.log(req.slot('ZONE'));
    			//console.log(foundZones);
    			cleanZone = didYouMean(req.slot('ZONE'), foundZones);
    			//console.log(cleanZone);
    			console.log('playZone Intent: playing in'+cleanZone);
    			savantLib.serviceRequest([cleanZone,"Play"],"zone");
    			res.say('playing in '+cleanZone).send();
    		});
    		return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
