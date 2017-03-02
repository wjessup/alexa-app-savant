const
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app,callback){

  var intentDictionary = {
    'name' : 'reboot',
    'version' : '3.0',
    'description' : 'Reboot alexa-app-savant skill',
    'enabled' : 1,
    'required' : {
      'resolve': [],
      'test':{},
      'failMessage': []
    },
    'voiceMessages' : {
      'success': "I'll be back"
    },
    'slots' : {},
    'utterances' : ['load intents']
  };

  if (intentDictionary.enabled === 1){
    app.intent(intentDictionary.name, {'slots':intentDictionary.slots,'utterances':intentDictionary.utterances},
    function(req,res) {
      var a = new eventAnalytics.event(intentDictionary.name);
      return app.prep(req, res)
        .then(function(req) {
          log.error(intentDictionary.name+' Intent: '+intentDictionary.voiceMessages.success);
          res.say(intentDictionary.voiceMessages.success).send();
          a.sendAlexa(['reboot','']);

        	var child = require('child_process');
        	var ps = child.exec('pm2 restart all --update-env', (error, stdout, stderr) =>{
        	   log.debug('Reboot Response: '+ stdout)
           });
        });
    }
    );
  }
  callback(intentDictionary);
};
