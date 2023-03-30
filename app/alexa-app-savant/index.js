'use strict';

const alexa = require('alexa-app');
const path = require('path');

const config = require('./userFiles/config');

const environmentLib = require('./lib/environmentLib');
const appDictionary = require('./lib/appDictionary');
const alexaSessionLib = require('./lib/alexaSessionLib');
const loadIntents = require('./lib/loadIntents');
const currentZoneLib = require('./lib/currentZoneLib');
const amazon_IoT = require('./lib/amazon_IoT');

const app = new alexa.app(config.skillName);

environmentLib(app)
  .then((ret) => {
    app.environment = ret;
    appDictionary(app);
    alexaSessionLib(app);
    loadIntents(app);
    currentZoneLib;
    amazon_IoT;
  })
  .catch((err) => {
    console.error(`Error: ${err}`);
  });

module.exports = app;