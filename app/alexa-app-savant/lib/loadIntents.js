'use strict';
log.error("loadintents")
const
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  intentRequired = require('./intentRequire.js');

module.exports = function(app){
  //Import all intents from /userFiles folder
  var userIntentsPath = path.resolve(__dirname,'../userIntents/');
  fs.readdirSync(userIntentsPath).forEach(function(file) {
    if (path.extname(file) === ".js") {
      require(userIntentsPath + '/' + file)(app,function(loadedIntent){
  			if (loadedIntent.enabled === 1){
  				log.error('Importing User Intent: '+ loadedIntent.name + ', Version: '+ loadedIntent.version);
          intentRequired.set(loadedIntent);
  			}else{
  				log.error('Skipping User Intent: '+ loadedIntent.name + ', Version: '+ loadedIntent.version);
  			}
      });
    }
  });

  //Import all intents from /defaultIntents folder
  var defaultIntentsPath = path.resolve(__dirname,'../defaultIntents/');
  fs.readdirSync(defaultIntentsPath).forEach(function(file) {
    if (path.extname(file) === ".js") {
      require(defaultIntentsPath + '/' + file)(app,function(loadedIntent){
        if (loadedIntent.enabled === 1){
  				log.error('Importing Default Intent: '+ loadedIntent.name + ', Version: '+ loadedIntent.version);
          intentRequired.set(loadedIntent);
  			}else{
  				log.error('Skipping Default Intent: '+ loadedIntent.name + ', Version: '+ loadedIntent.version);
  			}
      });
    }
  });


};
