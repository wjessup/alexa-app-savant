//Intent includes
var matcher = require('../lib/zoneMatcher');
var action = require('../lib/actionLib');
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
        //console.log(req.slot('RANGE'));

        //Get clean zones, fail if we cant find a match
        var cleanZones = matcher.zonesMatcher(req.slot('ZONE'),req.slot('ZONE_TWO'), function (err,cleanZones){
          voiceMessage = err;
          voiceMessageNote = "(Invalid Zone Match, cleanZones: "+cleanZones+")";
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ("+voiceMessageNote+")");
          res.say(voiceMessage).send();
        });
        if (cleanZones[0].length === 0){
          return
        }

        //
        //If not a lighting request turn on last used AV source
        if ((!req.slot('LIGHTING')) && (!req.slot('RANGE')) && (!req.slot('PERCENTAGE'))){
          console.log(intentDictionary.intentName+' Intent: '+'not a lighting request turn on last used AV source');

          //Get last service and turn on in all cleanZones
          action.lastPowerOn(cleanZones[0], function(err){
            if (err){
              var voiceMessage = 'No previous service. Please say which service to turn on';
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
              res.say(voiceMessage).send();
              return
            }
          });

          //message to send
          if (cleanZones[0].length>1){//say service name if only one zone
            var voiceMessage = 'Turning on '+cleanZones;
          }else {
            var voiceMessage = 'Turning on '+cleanZoneArray[6]+ ' in '+cleanZones;
          }

          //inform
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        }


        //If a lighting request with range, turn on lights with requested range
        if (req.slot('LIGHTING') && req.slot('RANGE') && typeof(req.slot('RANGE'))=="string"){
          console.log(intentDictionary.intentName+' Intent: '+'a lighting request with range, turn on lights with requested range');

          //set lights to range in all cleanZones
          action.setLighting(cleanZones[0],req.slot('RANGE'), function (err){
            if (err){
              console.log (intentDictionary.intentName+' Intent: '+err+" Note: ()");
              res.say(err).send();
              return
            }
          });

          //inform
          var voiceMessage = 'Setting lights to '+req.slot('RANGE')+' in '+cleanZones[1];
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
			  }


        //if a lighting request with a percentage, turn on lights with requested percentage
        if (req.slot('LIGHTING') && req.slot('PERCENTAGE') && req.slot('PERCENTAGE')>(-1) && req.slot('PERCENTAGE')<101 ){
          console.log(intentDictionary.intentName+' Intent: '+'a lighting request with a percentage, turn on lights with requested percentage');

          //set lights to percentage in all cleanZones
          var value = Number(req.slot('PERCENTAGE'));
          action.setLighting(cleanZones[0],value, function (err){
            if (err){
              console.log (intentDictionary.intentName+' Intent: '+err+" Note: ()");
              res.say(err).send();
              return
            }
          });

          //inform
          var voiceMessage = "Setting lights to "+req.slot('PERCENTAGE')+" percent in "+ cleanZones[1];
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        }

        //
        //if a lighting request without a percentage or range, turn on light to preset value
        //
        if (req.slot('LIGHTING') && (!req.slot('PERCENTAGE')) && (!req.slot('RANGE'))){
          console.log(intentDictionary.intentName+' Intent: '+'a lighting request without a percentage or range, turn on light to preset value');

          //set lights to 100% in all cleanZones
          var value = Number(req.slot('PERCENTAGE'));
          action.setLighting(cleanZones[0],100, function (err){
            if (err){
              console.log (intentDictionary.intentName+' Intent: '+err+" Note: ()");
              res.say(err).send();
              return
            }
          });

          var voiceMessage = 'Turning on lights in'+cleanZones[1];
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
