const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib');
  savantLib = require('../lib/savantLib');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'AV_sleepQuery',
    'intentVersion' : '1.0',
    'intentDescription' : 'get SleepTimerRemainingTime from zone sleep timer',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('AV_sleepQuery', {
    		"slots":{"ZONE":"ZONE"}
    		,"utterances":["how much time is left in {-|ZONE}","how much longer in {-|ZONE}","how much time is left on the sleep timer in {-|ZONE}"]
    	}, function(req,res) {
        matcher.zoneMatcher((req.slot('ZONE')), function (err, cleanZone){
          if (err) {
              var voiceMessage = err;
              console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (Invalid Zone Match)");
              res.say(voiceMessage).send();
              return
          }
          console.log("cleanZone: "+cleanZone);
          savantLib.readState(cleanZone+'.SleepTimerRemainingTime', function(RemainingTime,stateIn) {
            console.log("RemainingTime:"+RemainingTime+"dsfsd");
            console.log("RemainingTime type :"+typeof(RemainingTime));
            console.log("stateIn: "+stateIn);
            var zone = stateIn.split(".");
            if (RemainingTime === ""){
              var voiceMessage = (zone[0] +'timer is not set');
            } else{
              var minsec = RemainingTime.split(":")
              var timeLeft = minsec[0];
              timeLeft = timeLeft.replace(/^[0\.]+/, "");
              console.log("timeLeft type :"+typeof(timeLeft));
              if (minsec[1]>30){
                timeLeft = timeLeft+1
              }
              var voiceMessage = (zone[0] +'timer has about '+ timeLeft +' minutes left');
            }
            console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
            res.say(voiceMessage).send();
      		});
        });
    		return false;
    	}
    );
  }
  callback(intentDictionary);
};
