//Intent includes
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'name' : 'powerOn_FirstFloor',
    'version' : '1.0',
    'description' : 'Power on known zones with last used service',
    'enabled' : 0
  };

//Intent Enable/Disable
  if (intentDictionary.enabled === 1){

//Intent
    app.intent('powerOn_FirstFloor', {
        "slots":{"ZONE":"ZONE"}
        ,"utterances":["{actionPrompt} on First Floor"]
      },function(req,res) {
          cleanState = 'Family Room.LastActiveService';
          //get last Service
          savantLib.readState(cleanState, function(LastActiveService) {
            log.error('LastActiveService: '+LastActiveService);

            if (LastActiveService){
              //log.error("last service:  " +LastActiveService);
              LastActiveService = LastActiveService.replace(/(\r\n|\n|\r)/gm,"");
              cleanStateArray = LastActiveService.split("-");
              //log.error("last service:  " +cleanStateArray);

              log.error('Power On Intent: Turning on '+cleanStateArray[1]+ 'in Family Room and Kitchen');
              savantLib.serviceRequest([cleanStateArray[0],cleanStateArray[1],cleanStateArray[2],cleanStateArray[3],cleanStateArray[4],"PowerOn"],"full");
              savantLib.serviceRequest(["Kitchen",cleanStateArray[1],cleanStateArray[2],cleanStateArray[3],cleanStateArray[4],"PowerOn"],"full");
              savantLib.serviceRequest([cleanStateArray[0],cleanStateArray[1],cleanStateArray[2],cleanStateArray[3],cleanStateArray[4],"Play"],"full");
              res.say('Turning on '+cleanStateArray[1]+ 'in Family Room and Kitchen').send();
            }else{
              log.error('Power On Intent: No previous service. Please choose a service to turn on');
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
