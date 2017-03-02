const
  commandLib = require('../commandLib.json'),
  _ = require('lodash'),
  didYouMean = require('didyoumean'),
  q = require('q');

function commandMatcher(requestedCommand){
  var a = new eventAnalytics.event();
  var defer = q.defer();
  if (!requestedCommand){var requestedCommand = ""}
  log.error('matcher.command - looking for: "'+requestedCommand+'"')
  var serviceCommand = commandLib.transport[_.toLower(requestedCommand)]

  if (!serviceCommand){
    log.error("matcher.command - Did not find command match")
    defer.reject({type:"reprompt",exception: "commandNoMatch"});
    return defer.promise
  }
  defer.resolve({avCommand:serviceCommand});
  a.sendTime("Matching","command.commandMatcher");
  return defer.promise
}

module.exports = {
  commandMatcher:commandMatcher
}
