const fs = require('fs');
const path = require('path');
const plist = require('simple-plist');
const _ = require('lodash');
const q = require('q');
const app = require('../app'); // assuming app has a dictionary object

const userPresetsFile = path.resolve(__dirname, '../userFiles/userPresets.plist');

const defaultUserPresets = {
  volume: {
    high: 34,
    medium: 25,
    low: 15,
  },
  lighting: {
    high: 100,
    medium: 50,
    low: 25,
    on: 100,
  },
  sourceComponent: {},
};

function getPresets() {
  let userPresets = {};
  if (fs.existsSync(userPresetsFile)) {
    userPresets = plist.readFileSync(userPresetsFile);
    if ( !userPresets.volume || !userPresets.lighting || !userPresets.sourceComponent ){
      makePresets(userPresets);
      plist.writeFileSync(userPresetsFile, userPresets);
    }
  } else {
    makePresets(userPresets);
    plist.writeFileSync(userPresetsFile, userPresets);
  }
  return userPresets;
}

function makePresets(userPresets){
  userPresets.volume = {};
  userPresets.lighting = {};
  userPresets.sourceComponent = {};

  for (const key of app.dictionary.systemZones) {
    userPresets.volume[key] =  {...defaultUserPresets.volume};
    userPresets.lighting[key] =  {...defaultUserPresets.lighting};
  }
  for (const key of app.dictionary.systemGroupNames) {
    userPresets.volume[key] =  {...defaultUserPresets.volume};
    userPresets.lighting[key] =  {...defaultUserPresets.lighting};
  }
  for (const key of app.dictionary.sourceComponents) {
    if (!userPresets.sourceComponent[key]){
      userPresets.sourceComponent[key] = {};
    }
    _.set(userPresets.sourceComponent[key],"playWithPower",false);
  };
}

function loadUserPresets() {
  const userPresets = getPresets();
  console.log('Finished Loading User Presets.');
  return userPresets;
}

const userPresets = loadUserPresets();

module.exports = userPresets;