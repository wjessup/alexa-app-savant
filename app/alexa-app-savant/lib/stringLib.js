const
  _ = require('lodash'),
  q = require('q');
  
function addAnd(cleanZones){
  if (cleanZones.length>1){//add "and" if more then one zone was requested
    var pos = (cleanZones.length)-1;
    cleanZones.splice(pos,0,"and");
  }
  return cleanZones;
}

function cleanRange(requestedRange){
  var defer = q.defer();
  switch (_.toLower(requestedRange)){
    case "high":
      requestedRange = "high"
      defer.resolve(requestedRange);
      break;
    case "hi":
      requestedRange = "high"
      defer.resolve(requestedRange);
      break;
    case "medium":
      requestedRange = "medium"
      defer.resolve(requestedRange);
      break;
    case "low":
      requestedRange = "low"
      defer.resolve(requestedRange);
      break;
    default:
      defer.reject('I didnt understand please try again. Say High,Medium,or Low');
      break;
  }
  return defer.promise
}

module.exports = {
  addAnd: addAnd,
  cleanRange:cleanRange
}
