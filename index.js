const
	AlexaAppServer = require('alexa-app-server');

log = require('loglevel');
log.setDefaultLevel(4)

require('log-timestamp');

AlexaAppServer.start( {
	server_root : __dirname,
	port:4141,
	httpsPort:1414,
  httpsEnabled:true,
	app_dir:"app",
	debug: true,
  privateKey:'private-key.pem',
  certificate:'cert.cer'
	,preRequest: function(json,req,res) {
		log.error("  ");
		log.error("  ");
		log.error("||||||||||||||||||||||||||| start ||||||||||||||||||||||||||| ");
		log.error("Intent Request: "+ JSON.stringify(json.request.intent));
		log.error("  ");
	}
	,postRequest: function(json,req,res) {
		log.error("||||||||||||||||||||||||||| end ||||||||||||||||||||||||||| ");
		log.error("  ");
		log.error("  ");
	}
});
