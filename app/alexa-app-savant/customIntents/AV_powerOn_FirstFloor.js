//Intent includes
var didYouMean = require('didYouMean');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'powerOn_FirstFloor',
    'intentVersion' : '1.0',
    'intentDescription' : 'Power on known zones with last used service',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('powerOn_FirstFloor', {
        "slots":{"ZONE":"LITERAL"}
        ,"utterances":["{actionPrompt} on First Floor"]
      },function(req,res) {
          cleanState = 'Family Room.LastActiveService';
          //get last Service
          savantLib.readState(cleanState, function(LastActiveService) {
            console.log('LastActiveService: '+LastActiveService);

            if (LastActiveService){
              //console.log("last service:  " +LastActiveService);
              LastActiveService = LastActiveService.replace(/(\r\n|\n|\r)/gm,"");
              cleanStateArray = LastActiveService.split("-");
              //console.log("last service:  " +cleanStateArray);

              console.log('Power On Intent: Turning on '+cleanStateArray[1]+ 'in Family Room and Kitchen');
              savantLib.serviceRequest([cleanStateArray[0],cleanStateArray[1],cleanStateArray[2],cleanStateArray[3],cleanStateArray[4],"PowerOn"],"full");
              savantLib.serviceRequest(["Kitchen",cleanStateArray[1],cleanStateArray[2],cleanStateArray[3],cleanStateArray[4],"PowerOn"],"full");
              savantLib.serviceRequest([cleanStateArray[0],cleanStateArray[1],cleanStateArray[2],cleanStateArray[3],cleanStateArray[4],"Play"],"full");
              res.say('Turning on '+cleanStateArray[1]+ 'in Family Room and Kitchen').send();
            }else{
              console.log('Power On Intent: No previous service. Please choose a service to turn on');
              res.say('No previous service. Please choose a service to turn on').send();
            }
          });
        return false;
      }
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
