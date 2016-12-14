//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'startService',
    'intentVersion' : '1.0',
    'intentDescription' : 'Turn on any service in any AV zone',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('startService', {
    		"slots":{"SERVICE":"LITERAL","ZONE":"LITERAL"}
    		,"utterances":["{enablePrompt} {services|SERVICE} in {systemZones|ZONE}"]
    	},function(req,res) {
    		//get services in all zones
        //console.log('plist: '+serviceOrderPlist);
    		zoneParse.getZoneServices(serviceOrderPlist, function (err, foundservices) {
    			//console.log("Found the following Services: ");
    			//console.log(foundservices);

          //Make sure foundservices exists
          if (typeof foundservices == 'undefined'){
            console.log ('StartService Intent: I had a problem reading from the savant system( empty response from getZoneService)');
            res.say('I had a problem reading from the savant system').send();
            return
          }

          //make a list of zones and make sure it matches request
    			zoneParse.getZones(zoneInfo, function (err, foundZones) {

            var ZoneName = didYouMean(req.slot('ZONE'), foundZones);
            console.log("ZoneName: "+ZoneName);

            //make sure ZoneName exists
            if (typeof ZoneName == 'undefined'){
              console.log ('StartService Intent: I didnt understand what zone wanted, please try again.(zoneName undefined)');
              res.say('I didnt understand which zone you wanted, please try again.').send();
              return
            }
            console.log('Going to do stuff in : '+ ZoneName)

    				//make a list of services in zone we want and make sure it matches request
    				var zoneServiceAlias = []
            var zoneServiceProfileName = []
    				for (var key in foundservices[ZoneName]){
    					zoneServiceAlias.push(foundservices[ZoneName][key][6]);
              zoneServiceProfileName.push(foundservices[ZoneName][key][1]);
    				}

            //validate service name against request.  First check if service alias matchs request
            console.log('Looking for: '+req.slot('SERVICE'));
    				console.log('Looking in zoneServiceAlias: '+zoneServiceAlias);
    				var ServiceName = didYouMean(req.slot('SERVICE'), zoneServiceAlias);
            console.log("ServiceName: "+ServiceName);
            //make sure ServiceName exists

            //get service array if we found a match
            if (ServiceName !== 'null'){
              //match requested service to service list
              //console.log(foundservices[ZoneName]);
      				var ServiceArray = foundservices[ZoneName].filter(function (el) {
          			return (el[6] === ServiceName);
      				})[0];
            }

            // if we have not yet found a match look in profile names
            if (typeof ServiceArray == 'undefined') {
              console.log('Looking in zoneServiceProfileName: '+zoneServiceProfileName);
              var ServiceName = didYouMean(req.slot('SERVICE'), zoneServiceProfileName);
              console.log("ServiceName: "+ServiceName);
              var ServiceArray = foundservices[ZoneName].filter(function (el) {
          			return (el[1] === ServiceName);
      				})[0];
            } else if (ServiceName == 'null') {
              //we did not find a match in alias or profile names
              console.log ('StartService Intent: I didnt understand what service you wanted, please try again.(ServiceName undefined)');
              res.say('I didnt understand what service you wanted, please try again.').send();
              return
            }




            //console.log(ServiceArray);
    				if (typeof ServiceArray == 'undefined'){
    					console.log ('StartService Intent: I didnt understand what service you wanted, please try again (service array undefined)');
    					res.say('I didnt understand what service you wanted, please try again').send();
              return
    				}

            console.log ('StartService Intent: Turning on '+ServiceName+' in '+ ZoneName);
  					savantLib.serviceRequest([ServiceArray[0],ServiceArray[1],ServiceArray[2],ServiceArray[3],ServiceArray[4],"PowerOn"],"full");
            savantLib.serviceRequest([ServiceArray[0],ServiceArray[1],ServiceArray[2],ServiceArray[3],ServiceArray[4],"Play"],"full");
  					res.say("turning on "+ServiceName+" in "+ ZoneName).send();

          });

        });
    	return false;
      });


    }
//Return intent meta info to index
  callback(intentDictionary);
};
