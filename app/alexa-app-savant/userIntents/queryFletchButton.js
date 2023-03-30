const bodyParser = require('body-parser');

// Set initial value of request state to 0
let requestState = 0;

// Export function that accepts express and alexaAppServerObject as arguments
module.exports = function(express, alexaAppServerObject) {
  // Middleware that parses incoming JSON and urlencoded request bodies
  express.use(bodyParser.json());
  express.use(bodyParser.urlencoded({ extended: false }));

  // Middleware that handles requests to the '/login' endpoint
  express.use('/login', function(req, res) {
    // Send response indicating this is a server-side login action
    res.send("Imagine this is a dynamic server-side login action");
  });

  // Middleware that handles GET requests to the '/auth' endpoint
  express.get('/auth', function(req, res) {
    // Set the requestState variable to the value of the 'state' query parameter
    requestState = req.query.state;

    // Log the values of the query parameters
    console.log(req.query.state);
    console.log(req.query.client_id);
    console.log(req.query.scope);
    console.log(req.query.response_type);

    // Redirect to the 'auth.html' page
    res.redirect('/auth/auth.html');
  });

  // Middleware that handles POST requests to the '/auth/auth.html' endpoint
  express.post('/auth/auth.html', function(req, res) {
    // Create a token from the username and password in the request body
    const stringToken = JSON.stringify({ username: req.body.username, password: req.body.password });
    const buffer = Buffer.from(stringToken);
    const token = buffer.toString('base64');

    // Redirect to the Pitangui authentication URL with the token as a query parameter
    res.redirect(`https://pitangui.amazon.com/api/skill/link/M2CCJYK7V32DZ5?venderId=28seven&state=${requestState}&code=${token}`);
    
    // Log the authentication URL (optional)
    console.log(`https://pitangui.amazon.com/api/skill/link/M2CCJYK7V32DZ5?venderId=28seven&state=${requestState}&code=${token}`);
  });
};