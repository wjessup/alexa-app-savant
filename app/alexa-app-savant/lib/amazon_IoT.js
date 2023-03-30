const _ = require('lodash');
const savantLib = require('./savantLib');

console.error("currentZoneLib - Restoring currentZone Savant...");

// Recall currentZone
console.error('currentZoneLib - currentzone.actionable:' + currentZone.actionable);

function set(stateValue, scope) {
  if (!stateValue || stateValue === "false" || stateValue.constructor === Array) {
    stateValue = [false];
  } else {
    stateValue = stateValue.split(",");
  }
  _.set(currentZone, scope, stateValue);
  savantLib.writeState(`userDefined.currentZone.${scope}`, stateValue);

  console.error(`currentZoneLib - Setting currentZone.${scope}: ${currentZone[scope]}`);
}

if (currentZone.actionable[0] === false) {
  currentZone = {};
  console.error("currentZoneLib - Using currentZone from savant...");
  
  savantLib.readState("userDefined.currentZone.speakable", function(stateValue) {
    set(stateValue, "speakable");
  });

  savantLib.readState("userDefined.currentZone.actionable", function(stateValue) {
    set(stateValue, "actionable");
  });
} else {
  console.error("currentZoneLib - Using currentZone from config.");
}

module.exports = {
  set
};