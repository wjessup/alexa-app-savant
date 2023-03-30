const AlexaAppServer = require('alexa-app-server');
const log = require('loglevel');
const fs = require('fs');
const path = require('path');

log.setLevel(4);
require('log-timestamp');

const options = {
  server_root: __dirname,
  app_dir: 'app',
  port: 1415,
  httpsEnabled: true,
  httpsPort: 1414,
  privateKey: fs.readFileSync(path.resolve(__dirname, 'private-key.pem')),
  certificate: fs.readFileSync(path.resolve(__dirname,  'cert.cer')),
  debug: true,
  verify: false,
  preRequest: function (json, req, res) {
    log.error(' ');
    log.error(' ');
    log.error('||||||||||||||||||||||||||| start |||||||||||||||||||||||||||');
    log.error('Intent Request: ' + JSON.stringify(json.request.intent));
    log.error(' ');
  },
  postRequest: function (json, req, res) {
    log.error('||||||||||||||||||||||||||| end |||||||||||||||||||||||||||');
    log.error(' ');
    log.error(' ');
  }
};

AlexaAppServer.start(options);