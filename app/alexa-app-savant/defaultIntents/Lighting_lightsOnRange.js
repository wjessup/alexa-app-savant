//Intent includes
var matcher = require('../lib/zoneMatcher');
var zoneParse = require('../lib/zoneParse');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'lightsOnRange',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set lighting for AV zone with high med low presets',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('lightsOnRange', {
    		"slots":{"RANGE":"LITERAL","ZONE":"ZONE"}
    		,"utterances":["{actionPrompt} {on |} {-|ZONE} lights {to |} {rangePrompt|RANGE}"]
    	},function(req,res) {
    		console.log("Received range: "+ req.slot('RANGE'));
        //Remove the word the if it exists
        editZone = req.slot('ZONE').replace(/the/ig,"");

        //Match request to zone then do something
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
              res.say(voiceMessage).send();
              return
          }
          //set volume scale
    			switch (req.slot('RANGE').toLowerCase()){
    				case "high":
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
        });
    	return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
