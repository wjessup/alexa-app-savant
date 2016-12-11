var didYouMean = require('didYouMean');
var zoneParse = require('../zoneParse');
var savantLib = require('../savantLib');

module.change_code = 1;
module.exports = function(app,callback){
  var intentArray = [
    intentName = 'startService',
    intentVersion = '1.0',
    intentDescription = 'Turn on any service in any AV zone'
  ];

  app.intent('startService', {
  		"slots":{"SERVICE":"LITERAL","ZONE":"LITERAL"}
  		,"utterances":["Turn on {services|SERVICE} in {systemZones|ZONE}"]
  	},function(req,res) {
  		//get services in all zones
  		zoneParse.getZoneServices(serviceOrderPlist, function (err, foundservices) {
  			//console.log("Found the following Services: ");
  			//console.log(foundservices);

  			//make a list of zones and make sure it matches request
  			zoneParse.getZones(zoneInfo, function (err, foundZones) {
  				var ZoneName = didYouMean(req.slot('ZONE'), foundZones);

  				//make a list of services in zone we want and make sure it matches request
  				var zoneServiceNames = []
  				for (var key in foundservices[ZoneName]){
  					zoneServiceNames.push(foundservices[ZoneName][key][1]);
  				}
  				//validate service name against request
  				//console.log(zoneServiceNames);
  				var ServiceName = didYouMean(req.slot('SERVICE'), zoneServiceNames);

  				//Turn on servce
  				var ServiceArray = foundservices[ZoneName].filter(function (el) {
      			return el[1] === ServiceName;
  				})[0];
  				//console.log(ServiceArray);
  				if (ServiceArray == undefined){
  					console.log ('StartService Intent: I didnt understand please try again (service array undefined)');
  					res.say('I didnt understand please try again').send();
  				} else{
  					console.log ('StartService Intent: Turning on '+ServiceName+' in '+ ZoneName);
  					savantLib.serviceRequest([ServiceArray[0],ServiceArray[1],ServiceArray[2],ServiceArray[3],ServiceArray[4],"PowerOn"],"full");
  					res.say("turning on "+ServiceName+" in "+ ZoneName).send();
  				}

  			});
  		});
  	return false;
  	}
  );
  callback(intentArray);
};
