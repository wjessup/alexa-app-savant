//Intent includes
var matcher = require('../lib/zoneMatcher');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');
var didYouMean = require('didyoumean');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'startService',
    'intentVersion' : '1.0',
    'intentDescription' : 'Turn on any service in any AV zone',
    'intentEnabled' : 1,
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('startService', {
    		"slots":{"SERVICE":"SERVICE","ZONE":"ZONE","ZONE_TWO":"ZONE_TWO"}
    		,"utterances":[
          "{enablePrompt} {-|SERVICE} in {the |} {-|ZONE}",
          "{enablePrompt} {-|SERVICE} in {the |} {-|ZONE} and {-|ZONE_TWO}",
          "{enablePrompt} {-|ZONE} to {-|SERVICE}",
          "{enablePrompt} {-|ZONE} and {-|ZONE_TWO} to {-|SERVICE}"
        ]
    	},function(req,res) {
        //Get clean zones, fail if we cant find a match
        var cleanZones = matcher.zonesMatcher(req.slot('ZONE'),req.slot('ZONE_TWO'), function (err,cleanZones){
          voiceMessage = err;
          voiceMessageNote = "(Invalid Zone Match, cleanZones: "+cleanZones+")";
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ("+voiceMessageNote+")");
          res.say(voiceMessage).send();
        });
        if (cleanZones[0].length === 0){
          return
        }

        //Do something with the zone list
    		foundservices = appDictionaryZoneServices;
        //console.log("Found the following Services: ");
        //console.log(foundservices);


        //Match request to zone then do something
        for (var key in cleanZones[0]){ //do each zone
          console.log("starting loop for "+cleanZones[0][key]);
          var zoneServiceAlias = []
          var zoneServiceProfileName = []
          var cleanZone = cleanZones[0][key];
  				for (var key in foundservices[cleanZone]){
  		       zoneServiceAlias.push(foundservices[cleanZone][key][6]);
             zoneServiceProfileName.push(foundservices[cleanZone][key][1]);
  			  }


          //validate service name against request.  First check if service alias matchs request
  				var ServiceName = didYouMean(req.slot('SERVICE'), zoneServiceAlias);
          //console.log("ServiceName: "+ServiceName);
          //console.log('Looking for: '+req.slot('SERVICE'));
  				//console.log('Looking in zoneServiceAlias: '+zoneServiceAlias);


          //get service array if we found a match
          if (ServiceName !== 'null'){
            //match requested service to service list
            //console.log(foundservices[cleanZone]);
    				var ServiceArray = foundservices[cleanZone].filter(function (el) {
        			return (el[6] === ServiceName);
    				})[0];
          }

          // if we have not yet found a match look in profile names
          if (typeof ServiceArray == 'undefined') {
            console.log('Looking in zoneServiceProfileName: '+zoneServiceProfileName);
            var ServiceName = didYouMean(req.slot('SERVICE'), zoneServiceProfileName);
            console.log("ServiceName: "+ServiceName);
            var ServiceArray = foundservices[cleanZone].filter(function (el) {
        			return (el[1] === ServiceName);
    				})[0];
          } else if (ServiceName == 'null') {
            //we did not find a match in alias or profile names
            var voiceMessage = 'I didnt understand what service you wanted, please try again.';
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (ServiceName undefined)");
            res.say(voiceMessage).send();
            return
          }

          //console.log(ServiceArray);
  				if (typeof ServiceArray == 'undefined'){
            var voiceMessage = 'I didnt understand what service you wanted, please try again.';
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (ServiceArray undefined)");
            res.say(voiceMessage).send();
            return
  				}

          //Turn on serviceRequest
  				savantLib.serviceRequest([ServiceArray[0],ServiceArray[1],ServiceArray[2],ServiceArray[3],ServiceArray[4],"PowerOn"],"full");
          savantLib.serviceRequest([ServiceArray[0],ServiceArray[1],ServiceArray[2],ServiceArray[3],ServiceArray[4],"Play"],"full");

        }
          var voiceMessage = 'turning on '+ServiceName+' in '+ cleanZones[1];
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();

    	return false;
      });


    }
  //Return intent meta info to index
  callback(intentDictionary);
};
