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
        //Make a zone list (Figure out if its single zone or process requested zones)
        if (currentZone != false){
          cleanZones[0] = currentZone
        } else {
          cleanZones = matcher.zonesMatcher(req.slot('ZONE'),req.slot('ZONE_TWO'), function (err,cleanZones){
            console.log (intentDictionary.intentName+' Intent: '+err+" Note: (Invalid Zone Match, cleanZones: "+cleanZones+")");
            res.say(err).send();
          });
          if (cleanZones.length === 0){
            return
          }
        }

        //Do something with the zone list
    		zoneParse.getZoneServices(serviceOrderPlist, function (err, foundservices) { //get services in all zones
          if (typeof foundservices == 'undefined'){ //Make sure foundservices exists
            var voiceMessage = 'I had a problem reading from the savant system';
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (empty response from getZoneService)");
            res.say(voiceMessage).send();
            return
          }

          //console.log("Found the following Services: ");
          //console.log(foundservices);


          //Match request to zone then do something
          for (var key in cleanZones){ //do each zone
    				var zoneServiceAlias = []
            var zoneServiceProfileName = []
            var cleanZone = cleanZones[key];
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
              var ServiceArray = foundservices[cleanZones[key]].filter(function (el) {
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

          //message to send
          if (cleanZones.length>1){//add "and" if more then one zone was requested
            var pos = (cleanZones.length)-1;
            cleanZones.splice(pos,0,"and");
          }
          var voiceMessage = 'turning on '+ServiceName+' in '+ cleanZones;
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        });
    	return false;
      });


    }
  //Return intent meta info to index
  callback(intentDictionary);
};
