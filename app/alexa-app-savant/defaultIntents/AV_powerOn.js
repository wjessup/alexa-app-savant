const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'powerOn',
    'intentVersion' : '2.0',
    'intentDescription' : 'Power on requested zone with last used service',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
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
      }, function(req,res) {
        var a = new eventAnalytics.event(intentDictionary.intentName);
        matcher.zonesMatcher(req.slot('ZONE'), req.slot('ZONE_TWO'))//Parse requested zone and return cleanZones
        .then(function(cleanZones) {
          //If not a lighting request turn on last used AV source
          if ((!req.slot('LIGHTING')) && (!req.slot('RANGE')) && (!req.slot('PERCENTAGE'))){
            a.sendAV([cleanZones,"Zone","PowerOn"]);
            console.log(intentDictionary.intentName+' Intent: '+'not a lighting request turn on last used AV source');
            return action.lastPowerOn(cleanZones)//Get last service and turn on in all cleanZones
            .thenResolve('Turning on '+cleanZones[1]);
          }

          //If a lighting request with range, turn on lights with requested range
          if (req.slot('LIGHTING') && req.slot('RANGE') && typeof(req.slot('RANGE'))=="string"){
            a.sendLighting([cleanZones,req.slot('RANGE'),req.slot('LIGHTING')]);
            console.log(intentDictionary.intentName+' Intent: '+'a lighting request with range, turn on lights with requested range');
            return action.setLighting(cleanZones,req.slot('RANGE'),"range")//set lights to range in all cleanZones
            .thenResolve('Setting lights to '+req.slot('RANGE')+' in '+cleanZones[1]);
  			  }

          //if a lighting request with a percentage, turn on lights with requested percentage
          if (req.slot('LIGHTING') && req.slot('PERCENTAGE') && (!req.slot('RANGE'))){
            a.sendLighting([cleanZones,req.slot('PERCENTAGE'),req.slot('LIGHTING')]);
            console.log(intentDictionary.intentName+' Intent: '+'a lighting request with a percentage, turn on lights with requested percentage');
            return action.setLighting(cleanZones,req.slot('PERCENTAGE'),"percent")//set lights to percentage in all cleanZones
            .thenResolve("Setting lights to "+req.slot('PERCENTAGE')+" percent in "+ cleanZones[1]);
          }

          //if a lighting request without a percentage or range, turn on light to preset value
          if (req.slot('LIGHTING') && (!req.slot('PERCENTAGE')) && (!req.slot('RANGE'))){
            a.sendLighting([cleanZones,"On",req.slot('LIGHTING')]);
            console.log(intentDictionary.intentName+' Intent: '+'a lighting request without a percentage or range, turn on light to preset value');
            return action.setLighting(cleanZones,100,"percent")//set lights to 100% in all cleanZones
            .thenResolve('Turning on lights in '+cleanZones[1]);
          }

          // need a catch here

        })
        .then(function(voiceMessage) {//Inform
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        })
        .fail(function(voiceMessage) {//Zone could not be found
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
        });
      return false;
      }
    );
  }
  callback(intentDictionary);
};
