const _ = require('lodash');
const q = require('q');
const event = require('eventAnalytics').event;

function getRange(requestedRange) {
  const defer = q.defer();

  switch (_.toLower(requestedRange)) {
    case 'high':
    case 'hi':
      defer.resolve({ range: 'high' });
      break;
    case 'medium':
      defer.resolve({ range: 'medium' });
      break;
    case 'low':
      defer.resolve({ range: 'low' });
      break;
    default:
      defer.reject({ type: 'endSession', exception: 'rangeNoMatch' });
      break;
  }

  event.sendTime('Matching', 'word.range');
  return defer.promise;
}

module.exports = {
  getRange,
};