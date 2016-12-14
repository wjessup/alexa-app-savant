//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'pauseZone',
    'intentVersion' : '1.0',
    'intentDescription' : 'Send pause to requested zone',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('pauseZone', {
    		"slots":{"ZONE":"LITERAL"}
    		,"utterances":["{to |} pause {systemZones|ZONE}","{systemZones|ZONE} pause"]
    	},function(req,res) {
          //get zone list and match to request
    		zoneParse.getZones(zoneInfo, function (err, foundZones) {
    			//console.log("Found the following zones: ");
    			//console.log(req.slot('ZONE'));
    			//console.log(foundZones);
    			cleanZone = didYouMean(req.slot('ZONE'), foundZones);
    			//console.log(cleanZone);
    			console.log('pauseZone Intent: pausing '+cleanZone);
    			savantLib.serviceRequest([cleanZone,"Pause"],"zone");
    			res.say('pausing '+cleanZone).send();
    		});
    		return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
