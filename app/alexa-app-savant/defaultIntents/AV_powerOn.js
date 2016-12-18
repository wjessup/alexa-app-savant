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
        "slots":{"ZONE":"ZONE","LIGHTING":"LIGHTING","RANGE":"RANGE","PERCENTAGE":"PERCENTAGE"}
        ,"utterances":[
          "{actionPrompt} on {-|ZONE}",
          "{actionPrompt} {-|ZONE}",
          "{actionPrompt} on {-|ZONE} {-|LIGHTING}",
          "{actionPrompt} {-|LIGHTING} in {-|ZONE}",
          "{actionPrompt} {-|LIGHTING} on {-|ZONE} to {-|RANGE}",
          "{actionPrompt} on {-|ZONE} {-|LIGHTING} to {-|RANGE}",
          "{actionPrompt} on {-|LIGHTING} to {-|RANGE} in {-|ZONE}",
          "{actionPrompt} {-|LIGHTING} on {-|ZONE} to {-|PERCENTAGE} percent",
          "{actionPrompt} on {-|ZONE} {-|LIGHTING} to {-|PERCENTAGE} percent",
          "{actionPrompt} {-|LIGHTING} to {-|PERCENTAGE} percent {-|ZONE}"
        ]
      },function(req,res) {
        //Match request to zone then do something
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
              res.say(voiceMessage).send();
              return
          }
          //If not lightins turn on AV
          if ((!req.slot('LIGHTING')) && (!req.slot('RANGE')) && (!req.slot('PERCENTAGE'))){
            //get last Service
            savantLib.readState(cleanZone+".LastActiveService", function(LastActiveService) {
              console.log("LastActiveService: "+LastActiveService)
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
          }
          //If no range found turn on lights
          console.log(req.slot('RANGE'));
          if (req.slot('LIGHTING') && req.slot('RANGE') && typeof(req.slot('RANGE'))=="string"){
          //If range found parse range
          switch (req.slot('RANGE').toLowerCase()){
    				case "high":
    					savantLib.serviceRequest([cleanZone],"lighting","",[100]);
    				  break;
            case "hi":
    					savantLib.serviceRequest([cleanZone],"lighting","",[100]);
    				  break;
    				case "medium":
    					savantLib.serviceRequest([cleanZone],"lighting","",[50]);
    				  break;
    				case "low":
    					savantLib.serviceRequest([cleanZone],"lighting","",[25]);
    				  break;
            default:
              var voiceMessage = 'I didnt understand please try again. Say High,Medium,or Low';
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
              res.say(voiceMessage).send();
        			return false;
      			  break;
            }
            //inform
            var voiceMessage = 'Setting '+cleanZone+' lights to '+req.slot('RANGE');
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
    			}

          if (req.slot('LIGHTING') && req.slot('PERCENTAGE') && req.slot('PERCENTAGE')>0 && req.slot('PERCENTAGE')<101 ){
            //message to send
            var voiceMessage = "Setting lights to to "+req.slot('PERCENTAGE')+" percent in "+ cleanZone;
            //Set Lighting
      			savantLib.serviceRequest([cleanZone],"lighting","",[req.slot('PERCENTAGE')]);
            //inform
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
          }

          if (req.slot('LIGHTING') && (!req.slot('PERCENTAGE')) && (!req.slot('RANGE'))){
            //message to send
            var voiceMessage = 'Turning on '+cleanZone+' lights';
            //set dim level
            savantLib.serviceRequest([cleanZone],"lighting","",[100]);
            //inform
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();

          }
        });
        return false;
      }
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
