const
  matcher = require('../lib/zoneMatcher'),
  action = require('../lib/actionLib'),
  serviceMatcher = require('../lib/serviceMatcher'),
  commandMatcher = require('../lib/commandMatcher'),
  q = require('q');

module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'serviceControl',
    'intentVersion' : '2.0',
    'intentDescription' : 'Send play to requested zone',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('serviceControl', {
    		"slots":{"ZONE":"ZONE","SERVICE":"SERVICE","COMMANDREQ":"COMMANDREQ"}
    		,"utterances":[
          "{to |} control {-|SERVICE}",
          "{to |} control {-|ZONE}",
          "{-|COMMANDREQ}",
          "{to |} {-|COMMANDREQ} in {-|ZONE}",
          "{to |} {-|COMMANDREQ} {-|ZONE}"

        ]
    	}, function(req,res) {
        console.log("+req.session('activeZone'): "+req.session('activeZone'))
        var requestedCommand = req.slot('COMMANDREQ');
        if (req.session('activeZone')){
          var activeZone = req.session('activeZone');
          console.log("activeZone: "+activeZone);
        }

        getActiveZone(req.slot('ZONE'),req.slot('SERVICE'),activeZone)
        .then(function(activeZone){
          console.log("got a zone "+activeZone);
          if (activeZone){
            console.log("i want to do something "+activeZone);
            console.log("going to try to: "+requestedCommand);
            if (requestedCommand){
              console.log("sending command: "+requestedCommand)
              commandMatcher.commandMatcher(requestedCommand)
              .then(function(serviceCommand){
                action.serviceCommand(activeZone,serviceCommand,"commandMatcher");
                res.reprompt();
                res.session('activeZone',activeZone);
                res.shouldEndSession(false);
              });
            }else{
              console.log('I am missing a command');
              res.say('please provide command').send();
              res.session('activeZone',activeZone);
              res.shouldEndSession(false);

            }
          }else{
            console.log('I am missing a zone')
            res.reprompt("Please provide a zone or service");

          }
        })
        .fail(function(voiceMessage) {//Zone could not be found
          console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: ()");
          res.say(voiceMessage).send();
          res.session('activeZone',activeZone);
          res.shouldEndSession(true);
        });

      }
    );
  }
  callback(intentDictionary);
};


function getActiveZone(requestedZone,requestedService,activeZone){
  var defer = q.defer();
  console.log("im here");
  console.log("requestedZone: "+requestedZone)
  console.log("requestedService: "+requestedService)

  if (activeZone){
    console.log("activeZone: "+activeZone)
    defer.resolve(activeZone);
  }else{
    if (!requestedZone && !requestedService) {
      var err = 'Please provide a zone or service';
      defer.reject(err);
      return defer.promise
    }
    if (requestedZone){
      console.log("looking for zone")
      var activeZone = matcher.zonesMatcher(requestedZone)
      .then(function(cleanZones){
        console.log("cleanZones: "+cleanZones)
        var activeZone = cleanZones[0][0];
        console.log("activeZone: "+activeZone)
        defer.resolve(activeZone);
      });
    }

    if (requestedService){
      console.log("looking for service")
      serviceMatcher.activeServiceNameMatcher(requestedService)
      .then(function(cleanZones){
        console.log("cleanZones: "+cleanZones)
        var activeZone = cleanZones[0][0];
        console.log("activeZone: "+activeZone)
        defer.resolve(activeZone);
      });
    }
  }
  return defer.promise
}
