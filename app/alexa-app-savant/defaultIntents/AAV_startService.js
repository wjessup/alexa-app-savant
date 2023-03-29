const action = require('../lib/actionLib');
const _ = require('lodash');
const format = require('simple-fmt');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = createIntentDictionary();

function createIntentDictionary() {
  return {
    /* dictionary properties */
  };
}

function handleIntent(app, intent) {
  const { req, res, name } = intent;
  
  /* logic for handling intents */
}

function registerIntent(app, intentDictionary, callback) {
  if (intentDictionary.enabled === 1) {
    app.intent(
      intentDictionary.name,
      { slots: intentDictionary.slots, utterances: intentDictionary.utterances },
      (req, res) => {
        handleIntent(app, { req, res, name: intentDictionary.name });
      }
    );
  }
  callback(intentDictionary);
}

module.exports = function (app, callback) {
  registerIntent(app, intentDictionary, callback);
};