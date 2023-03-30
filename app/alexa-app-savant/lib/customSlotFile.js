'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');

/**
 * Required Dictionary Object.
 * Stores the required values of the intent dictionary.
 */
const requiredDic = {};

/**
 * Add an intent dictionary to the requiredDict object.
 * @param {Object} intentDictionary - The intent dictionary to add.
 */
function set(intentDictionary) {
  if (_.has(intentDictionary, "required")) {
    _.set(requiredDic, intentDictionary.name, intentDictionary.required);
    console.log(`Required set for intent: ${intentDictionary.name}`);
  } else {
    _.set(requiredDic, intentDictionary.name, "");
    console.log(`No required set for intent: ${intentDictionary.name}`);
  }
}

/**
 * Get the required values of an intent.
 * @param {String} intent - The intent to get the required values for.
 * @returns {Array} - An array of required values.
 */
function get(intent) {
  return requiredDic[intent];
}

// Export the required methods.
module.exports = {
  set,
  get
};