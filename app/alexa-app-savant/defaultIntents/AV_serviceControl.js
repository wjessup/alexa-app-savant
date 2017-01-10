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
    'intentVersion' : '1.0',
    'intentDescription' : 'Send play to requested zone',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('serviceControl', {
    		"slots":{"ZONE":"ZONE","SERVICE":"SERVICE","COMMANDREQ":"COMMANDREQ"}
    		,"utterances":[
          "{to |} control {-|SERVICE}",
          "{to |} control {-|ZONE}",
          "{serviceCommands}"
        ]
    	}, function(req,res) {
        var requestedCommand = req.slot('COMMAND');
        if (req.session('activeZone')){
          var activeZone = req.session('activeZone');
        }

        getActiveZone(req.slot('ZONE'),req.slot('SERVICE'))
        .then(function(activeZone){
          console.log("got a zone "+activeZone);
          if (activeZone){
            console.log("i want to do something "+activeZone);
            if (activeService && req.slot('RCOMMAND')){
              commandMatcher.commandMatcher(requestedCommand)
              .then(function(serviceCommand){
                action.serviceCommand(activeZone,serviceCommand);
                res.say(requestedCommand);
              });
            }else{
              res.say("Please say a command");
            }
          }else{
            res.say("Please provide a zone or service");
          }
        });
        res.session('activeZone',activeZone);
        res.shouldEndSession(false);
      }
    );
  }
  callback(intentDictionary);
};


function getActiveZone(requestedZone,requestedService){
  var defer = q.defer();
  console.log("im here");
  console.log("requestedZone: "+requestedZone)
  console.log("requestedService: "+requestedService)

  if (requestedZone){
    console.log("looking for zone")
    var activeZone = matcher.zonesMatcher(requestedZone)
    .then(function(cleanZones){
      var activeZone = cleanZones[0][0];
      defer.resolve(activeZone);
      return defer.promise
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
      return defer.promise
    });
  }

}
