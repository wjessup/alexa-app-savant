'use strict';

const path = require('path');
const fs = require('fs');
const intentRequired = require('./intentRequire.js');

module.exports = function loadIntents(app) {
  const userIntentsPath = path.resolve(__dirname, '../userIntents/');
  fs.readdirSync(userIntentsPath).forEach((file) => {
    if (path.extname(file) === '.js') {
      const loadedIntent = require(path.join(userIntentsPath, file));
      if (loadedIntent.enabled === 1) {
        console.log(`Importing User Intent: ${loadedIntent.name}, Version: ${loadedIntent.version}`);
        intentRequired.set(loadedIntent);
      } else {
        console.log(`Skipping User Intent: ${loadedIntent.name}, Version: ${loadedIntent.version}`);
      }
      loadedIntent(app);
    }
  });

  const defaultIntentsPath = path.resolve(__dirname, '../defaultIntents/');
  fs.readdirSync(defaultIntentsPath).forEach((file) => {
    if (path.extname(file) === '.js') {
      const loadedIntent = require(path.join(defaultIntentsPath, file));
      if (loadedIntent.enabled === 1) {
        console.log(`Importing Default Intent: ${loadedIntent.name}, Version: ${loadedIntent.version}`);
        intentRequired.set(loadedIntent);
      } else {
        console.log(`Skipping Default Intent: ${loadedIntent.name}, Version: ${loadedIntent.version}`);
      }
      loadedIntent(app);
    }
  });
};