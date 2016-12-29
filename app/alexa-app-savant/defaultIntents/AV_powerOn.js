//Intent includes
var matcher = require('../lib/zoneMatcher');
var savantLib = require('../lib/savantLib');
var cleanZones = [];

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
        "slots":{"ZONE":"ZONE","ZONE_TWO":"ZONE_TWO","LIGHTING":"LIGHTING","RANGE":"RANGE","PERCENTAGE":"PERCENTAGE"}
        ,"utterances":[
          "{actionPrompt} on",
          "{actionPrompt} on {-|ZONE}",
          "{actionPrompt} {-|ZONE}",
          "{actionPrompt} {-|ZONE} and {-|ZONE_TWO}",
          "{actionPrompt} on {-|ZONE} {-|LIGHTING}",
          "{actionPrompt} on {-|ZONE} and {-|ZONE_TWO} {-|LIGHTING}",
          "{actionPrompt} {-|LIGHTING} on",
          "{actionPrompt} {-|LIGHTING} in {-|ZONE}",
          "{actionPrompt} {-|LIGHTING} in {-|ZONE} and {-|ZONE_TWO}",
          "{actionPrompt} {-|LIGHTING} to {-|RANGE}",
          "{actionPrompt} {-|LIGHTING} on {-|ZONE} to {-|RANGE}",
          "{actionPrompt} {-|LIGHTING} on {-|ZONE} and {-|ZONE_TWO} to {-|RANGE}",
          "{actionPrompt} on {-|ZONE} {-|LIGHTING} to {-|RANGE}",
          "{actionPrompt} on {-|ZONE} {-|LIGHTING} and {-|ZONE_TWO} to {-|RANGE}",
          "{actionPrompt} on {-|LIGHTING} to {-|RANGE} in {-|ZONE}",
          "{actionPrompt} on {-|LIGHTING} to {-|RANGE} in {-|ZONE} and {-|ZONE_TWO}",
          "{actionPrompt} {-|LIGHTING} to {-|PERCENTAGE} percent",
          "{actionPrompt} {-|LIGHTING} on {-|ZONE} to {-|PERCENTAGE} percent",
          "{actionPrompt} {-|LIGHTING} on {-|ZONE} and {-|ZONE_TWO} to {-|PERCENTAGE} percent",
          "{actionPrompt} {-|ZONE} {-|LIGHTING} to {-|PERCENTAGE} percent",
          "{actionPrompt} {-|ZONE} and {-|ZONE_TWO} {-|LIGHTING} to {-|PERCENTAGE} percent",
          "{actionPrompt} {-|LIGHTING} to {-|PERCENTAGE} percent {-|ZONE}",
          "{actionPrompt} {-|LIGHTING} to {-|PERCENTAGE} percent {-|ZONE} and {-|ZONE_TWO} "
        ]
      },function(req,res) {
        //Match request to zone then do something
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
        //
        //If not a lighting request turn on last used AV source
        //
        if ((!req.slot('LIGHTING')) && (!req.slot('RANGE')) && (!req.slot('PERCENTAGE'))){
          console.log(intentDictionary.intentName+' Intent: '+'not a lighting request turn on last used AV source');
          //get last Service
          for (var key in cleanZones){
            savantLib.readState(cleanZones[key]+".LastActiveService", function(LastActiveService) {
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
            });
          }
          //message to send
          if (cleanZones.length>1){//add "and" if more then one zone was requested
            var pos = (cleanZones.length)-1;
            cleanZones.splice(pos,0,"and");
            var voiceMessage = 'Turning on '+cleanZones;
          }else {
            var voiceMessage = 'Turning on '+cleanZoneArray[1]+ ' in '+cleanZones;
          }

          //inform
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        }

        //
        //If a lighting request with range, turn on lights with requested range
        //
        //console.log(req.slot('RANGE'));
        if (req.slot('LIGHTING') && req.slot('RANGE') && typeof(req.slot('RANGE'))=="string"){ //If range found parse range
          console.log(intentDictionary.intentName+' Intent: '+'a lighting request with range, turn on lights with requested range');
          for (var key in cleanZones){
            switch (req.slot('RANGE').toLowerCase()){
      				case "high":
      					savantLib.serviceRequest([cleanZones[key]],"lighting","",[100]);
      				  break;
              case "hi":
      					savantLib.serviceRequest([cleanZones[key]],"lighting","",[100]);
      				  break;
      				case "medium":
      					savantLib.serviceRequest([cleanZones[key]],"lighting","",[50]);
      				  break;
      				case "low":
      					savantLib.serviceRequest([cleanZones[key]],"lighting","",[25]);
      				  break;
              default:
                var voiceMessage = 'I didnt understand please try again. Say High,Medium,or Low';
                console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
                res.say(voiceMessage).send();
          			return false;
        			  break;
            }
          }
          //message to send
          if (cleanZones.length>1){//add "and" if more then one zone was requested
            var pos = (cleanZones.length)-1;
            cleanZones.splice(pos,0,"and");
          }
          var voiceMessage = 'Setting '+cleanZones+' lights to '+req.slot('RANGE');
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
			  }

        //
        //if a lighting request with a percentage, turn on lights with requested percentage
        //
        if (req.slot('LIGHTING') && req.slot('PERCENTAGE') && req.slot('PERCENTAGE')>(-1) && req.slot('PERCENTAGE')<101 ){
          console.log(intentDictionary.intentName+' Intent: '+'a lighting request with a percentage, turn on lights with requested percentage');
          for (var key in cleanZones){
            //Set Lighting
            savantLib.serviceRequest([cleanZones[key]],"lighting","",[req.slot('PERCENTAGE')]);
          }
          //message to send
          if (cleanZones.length>1){//add "and" if more then one zone was requested
            var pos = (cleanZones.length)-1;
            cleanZones.splice(pos,0,"and");
          }
          var voiceMessage = "Setting lights to "+req.slot('PERCENTAGE')+" percent in "+ cleanZones;
          //inform
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        }

        //
        //if a lighting request without a percentage or range, turn on light to preset value
        //
        if (req.slot('LIGHTING') && (!req.slot('PERCENTAGE')) && (!req.slot('RANGE'))){
          console.log(intentDictionary.intentName+' Intent: '+'a lighting request without a percentage or range, turn on light to preset value');
          for (var key in cleanZones){
            //set dim level
            savantLib.serviceRequest([cleanZones[key]],"lighting","",[100]);
          }
          //message to send
          if (cleanZones.length>1){//add "and" if more then one zone was requested
            var pos = (cleanZones.length)-1;
            cleanZones.splice(pos,0,"and");
          }
          var voiceMessage = 'Turning on '+cleanZones+' lights';
          //inform
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();

        }

      return false;
      }
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
