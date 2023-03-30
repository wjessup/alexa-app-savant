const _ = require('lodash');
const q = require('q');

// function to add the word 'and' if there are multiple requested zones
function addAnd(cleanZones) {
  if (cleanZones.length > 1) {
    // add 'and' before the last zone
    const pos = cleanZones.length - 1;
    cleanZones.splice(pos, 0, "and");
  }
  return cleanZones;
}

// function to clean and validate a requested range
function cleanRange(requestedRange) {
  const defer = q.defer();
  // convert the requested range to lowercase
  const lowerCaseRange = _.toLower(requestedRange);
  // check the requested range against known values and resolve with cleaned value or reject with an error message
  switch (lowerCaseRange) {
    case "high":
    case "hi":
    	defer.resolve("high");
    	break;
    case "medium":
    	defer.resolve("medium");
    	break;
    case "low":
    	defer.resolve("low");
    	break;
    default:
    	defer.reject("I didn't understand. Please try again. Say High, Medium, or Low.");
    	break;
  }
  return defer.promise;
}

// export the two functions for use
module.exports = {
  addAnd,
  cleanRange
};