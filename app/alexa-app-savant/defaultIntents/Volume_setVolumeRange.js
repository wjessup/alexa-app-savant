//Intent includes
var matcher = require('../lib/zoneMatcher');
var savantLib = require('../lib/savantLib');

//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

  //Intent meta information
  var intentDictionary = {
    'intentName' : 'setVolumeRange',
    'intentVersion' : '1.0',
    'intentDescription' : 'Set volume for AV zone with high med low presets',
    'intentEnabled' : 1
  };

  //Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){
    //Intent
    app.intent('setVolumeRange', {
    		"slots":{"RANGE":"RANGE","ZONE":"ZONE"}
    		,"utterances":["set volume in {-|ZONE} {to |} {-|RANGE}","set {-|ZONE} volume {to |} {-|RANGE}"]
    	},function(req,res) {
    		console.log("Received range: "+ req.slot('RANGE'));
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
    					savantLib.serviceRequest([cleanZone],"volume","",[34]);
    				  break;
    				case "medium":
    					savantLib.serviceRequest([cleanZone],"volume","",[25]);
    				  break;
    				case "low":
    					savantLib.serviceRequest([cleanZone],"volume","",[15]);
    				  break;
            default:
              var voiceMessage = 'I didnt understand please try again. Say High,Medium,or Low';
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
              res.say(voiceMessage).send();
        			return false;
      			  break;
    			}
        });
        //inform
        var voiceMessage = 'Setting volume to '+req.slot('RANGE')+' in '+ cleanZone;
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
        res.say(voiceMessage).send();
    	return false;
    	}
    );
  }
  //Return intent meta info to index
  callback(intentDictionary);
};
