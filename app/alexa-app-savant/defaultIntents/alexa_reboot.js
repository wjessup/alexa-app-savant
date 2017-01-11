module.change_code = 1;
module.exports = function(app,callback){

  var intentDictionary = {
    'intentName' : 'reboot',
    'intentVersion' : '1.0',
    'intentDescription' : 'Reboot alexa-app-savant skill',
    'intentEnabled' : 1
  };

  if (intentDictionary.intentEnabled === 1){
    app.intent('reboot', {
    		"slots":{}
    		,"utterances":["load intents"]
    	},function(req,res) {
        var voiceMessage = "I'll be back";
        console.log (intentDictionary.intentName+' Intent: '+voiceMessage+" Note: (pm2 restart all --update-env)");
        res.say(voiceMessage).send();

      	var child = require('child_process');
      	var ps = child.exec("pm2 restart all --update-env", (error, stdout, stderr) =>{
      	   console.log('Reboot Response: '+ stdout)
         });
    		return false;
    	}
    );
  }
  callback(intentDictionary);
};
