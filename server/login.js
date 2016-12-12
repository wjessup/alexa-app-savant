var bodyParser = require('body-parser');
requestState=0;

module.exports = function(express,alexaAppServerObject) {
	express.use(bodyParser.json()); // support json encoded bodies
	express.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies

	express.use('/login',function(req,res) {
		res.send("Imagine this is a dynamic server-side login action");
	});


	express.get('/auth', function(req, res) {
		requestState = req.query.state;
		console.log(req.query.state);
		console.log(req.query.client_id);
		console.log(req.query.scope);
		console.log(req.query.response_type);
		res.redirect('/auth/auth.html');
	});


	express.post('/auth/auth.html', function(req, res) {
		stringToken = JSON.stringify({username:req.body['username'],password:req.body['password']});
		var buffer = new Buffer(stringToken);
		var Token = buffer.toString('base64');
		res.redirect('https://pitangui.amazon.com/api/skill/link/M2CCJYK7V32DZ5?venderId=28seven&state='+requestState+'&code='+Token);
		console.log('https://pitangui.amazon.com/api/skill/link/M2CCJYK7V32DZ5?venderId=28seven&state='+requestState+'&code='+Token);

	//var buffer = new Buffer(Token, 'base64');
	//var temp = buffer.toString('ascii');
	//	console.log(temp);
	});




};
