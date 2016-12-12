var AlexaAppServer = require('alexa-app-server');

AlexaAppServer.start( {
	server_root : __dirname,
	port:8181,
	httpsPort:1414,
  httpsEnabled:true,
	app_dir:"app",
  privateKey:'private-key.pem',
  certificate:'cert.cer'
	// Use preRequest to load user data on each request and add it to the request json.
	// In reality, this data would come from a db or files, etc.
	,preRequest: function(json,req,res) {
		console.log("preRequest fired");
		//console.log("prestuff:"+JSON.stringify(json));
	}
	// Add a dummy attribute to the response
	,postRequest: function(json,req,res) {
		//console.log("poststuff:"+JSON.stringify(json));
	}
} );
