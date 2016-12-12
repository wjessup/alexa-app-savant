//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'setVolumeRange',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set volume for AV zone with high med low presets',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('setVolumeRange', {
    		"slots":{"RANGE":"LITERAL","ZONE":"LITERAL"}
    		,"utterances":["set volume in {systemZones|ZONE} {to |} {rangePrompt|RANGE}","set {systemZones|ZONE} volume {to |} {rangePrompt|RANGE}"]
    	},function(req,res) {
    		console.log("Received range: "+ req.slot('RANGE'));
    		//make a list of zones and make sure it matches request
    		zoneParse.getZones(zoneInfo, function (err, foundZones) {
    			var ZoneName = didYouMean(req.slot('ZONE'), foundZones);

    		if (req.slot('RANGE') == undefined && ZoneName == undefined){
    			res.say("I didnt understand please try again").send();
    		} else{
    			//set volume scale
    			switch (req.slot('RANGE').toLowerCase()){
    				case "high":
    					savantLib.serviceRequest([ZoneName],"volume","",[34]);
    					res.say("Setting volume to "+req.slot('RANGE')+" in "+ ZoneName).send();
    				break;
    				case "medium":
    					savantLib.serviceRequest([ZoneName],"volume","",[25]);
    					res.say("Setting volume to "+req.slot('RANGE')+" in "+ ZoneName).send();
    				break;
    				case "low":
    					savantLib.serviceRequest([ZoneName],"volume","",[15]);
    					res.say("Setting volume to "+req.slot('RANGE')+" in "+ ZoneName).send();
    				break;
    			}
    		}
    		});
    	return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
