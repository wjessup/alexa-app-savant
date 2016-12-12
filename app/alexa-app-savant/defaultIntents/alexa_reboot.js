//Intent includes


//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'reboot',
    'intentVersion' : '1.0',
    'intentDescription' : 'Reboot alexa-app-savant skill',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('reboot', {
    		"slots":{"ZONE":"LITERAL"}
    		,"utterances":["reboot","reload","reboot skill","reload skill","reboot intents","reload intents","load intents","add intents"]
    	},function(req,res) {
          res.say("I'll be back").send();
          console.log("Running:  pm2 restart all --update-env");

        	var child = require('child_process');
        	var ps = child.exec("pm2 restart all --update-env", (error, stdout, stderr) =>{
        	   console.log('Reboot Response: '+ stdout)
           });
    		return false;
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};