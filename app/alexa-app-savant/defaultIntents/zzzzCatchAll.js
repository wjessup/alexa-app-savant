const
  _ = require('lodash'),
  action = require('../lib/actionLib'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'zzzzCatchAll',
    'version' : '3.0',
    'description' : 'catch rogue requests',
    'enabled' : 1,
    'required' : {
      'resolve': {},
      'test':{}
    },
    'voiceMessages' : {
      'success': ''
    },
    'slots' : {'ZONE':'ZONE','ZONE_TWO':'ZONE_TWO','SERVICE':'SERVICE','COMMANDREQ':'COMMANDREQ'},
    'utterances' : [
      '{-|ZONE}',
      '{-|ZONE_TWO}',
      '{-|SERVICE}',
      '{-|COMMANDREQ}'
    ]
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {
          //this should never run
          a.sendAlexa(['zzzzCatchAllIntnet','']);
        })
        .fail(function(err) {
          app.intentErr(req,res,err);
        });
    }
    );
  }
  callback(intentDictionary);
};
