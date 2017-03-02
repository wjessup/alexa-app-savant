const
  _ = require('lodash'),
  q = require('q');

function range(requestedRange){
  var a = new eventAnalytics.event();
  var defer = q.defer();
  switch (_.toLower(requestedRange)){
    case "high":
      defer.resolve({"range":"high"});
      break;
    case "hi":
      defer.resolve({"range":"high"});
      break;
    case "medium":
      defer.resolve({"range":"medium"});
      break;
    case "low":
      defer.resolve({"range":"low"});
      break;
    default:
      defer.reject({type: "endSession", exception: "rangeNoMatch"});
      break;
  }
  a.sendTime("Matching","word.range");
  return defer.promise
}

module.exports = {
  range: range
}
