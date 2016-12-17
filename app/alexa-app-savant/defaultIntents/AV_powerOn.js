//Intent includes
var matcher = require('../lib/zoneMatcher');
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
        "slots":{"ZONE":"ZONE"}
        ,"utterances":["{actionPrompt} on {-|ZONE}"]
      },function(req,res) {
        //Match request to zone then do something
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
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

            //message to send
            var voiceMessage = 'Turning on '+cleanZoneArray[1]+ 'in '+req.slot('ZONE');
            //inform
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
          });
        });
        return false;
      }
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
