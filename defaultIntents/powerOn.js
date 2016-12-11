var didYouMean = require('didYouMean');
var zoneParse = require('../zoneParse');
var savantLib = require('../savantLib');

module.change_code = 1;
module.exports = function(app,callback){
  intentArray = [
    intentName = 'powerOn',
    intentVersion = '1.0',
    intentDescription = 'Power on requested zone with last used service'
  ];

  app.intent('powerOn', {
      "slots":{"ZONE":"LITERAL"}
      ,"utterances":["{actionPrompt} on {systemZones|ZONE}"]
    },function(req,res) {
      //get zone list and match to request
      zoneParse.getZones(zoneInfo, function (err, foundZones) {
        //console.log("Found the following zones: ");
        //console.log(req.slot('ZONE'));
        //console.log(foundZones);
        cleanState = didYouMean(req.slot('ZONE'), foundZones)+'.LastActiveService';

        //get last Service, remove LF, put in array
        savantLib.readState(cleanState, function(LastActiveService) {
          //console.log("last service:  " +LastActiveService);
          LastActiveService = LastActiveService.replace(/(\r\n|\n|\r)/gm,"");
          cleanStateArray = LastActiveService.split("-");
          //console.log("last service:  " +cleanStateArray);

          console.log('Power On Intent: Turning on '+cleanStateArray[1]+' in '+req.slot('ZONE'));
          savantLib.serviceRequest([cleanStateArray[0],cleanStateArray[1],cleanStateArray[2],cleanStateArray[3],cleanStateArray[4],"PowerOn"],"full");
          savantLib.serviceRequest([cleanStateArray[0],cleanStateArray[1],cleanStateArray[2],cleanStateArray[3],cleanStateArray[4],"Play"],"full");
          res.say('Turning on '+cleanStateArray[1]+ 'in '+req.slot('ZONE')).send();
        });
      });
      return false;
    }
  );
  callback(intentArray);
};
