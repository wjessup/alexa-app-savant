//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'powerOn',
    'intentVersion' : '1.0',
    'intentDescription' : 'Power on requested zone with last used service',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('powerOn', {
        "slots":{"ZONE":"LITERAL"}
        ,"utterances":["{actionPrompt} on {systemZones|ZONE}"]
      },function(req,res) {
        //Match request to zone list / build LastActiveService state
        cleanZone = didYouMean(req.slot('ZONE'), appDictionaryArray)+'.LastActiveService';
        console.log('cleanZone: '+ cleanZone);

        //make sure cleanZone exists
        if (typeof cleanZone == 'undefined' || cleanZone == null){
          var voiceMessage = 'I didnt understand which zone you wanted, please try again.';
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (cleanZone undefined)");
          res.say(voiceMessage).send();
          return
        }

        //get last Service, remove LF, put in array
        savantLib.readState(cleanZone, function(LastActiveService) {
          //remove lf from response
          LastActiveService = LastActiveService.replace(/(\r\n|\n|\r)/gm,"");

          if (typeof LastActiveService == 'undefined' || LastActiveService == ''){
            var voiceMessage = 'No previous service. Please say which service to turn on';
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
            return
          }

          cleanZoneArray = LastActiveService.split("-");
          //console.log("last service:  " +LastActiveService);

          //turn on zone
          savantLib.serviceRequest([cleanZoneArray[0],cleanZoneArray[1],cleanZoneArray[2],cleanZoneArray[3],cleanZoneArray[4],"PowerOn"],"full");
          savantLib.serviceRequest([cleanZoneArray[0],cleanZoneArray[1],cleanZoneArray[2],cleanZoneArray[3],cleanZoneArray[4],"Play"],"full");

          //inform
          var voiceMessage = 'Turning on '+cleanZoneArray[1]+ 'in '+req.slot('ZONE');
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        });
        return false;
      }
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
