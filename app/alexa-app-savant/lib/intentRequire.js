const commandLib = require('../commandLib.json');
const _ = require('lodash');
const didYouMean = require('didyoumean');
const q = require('q');
const eventAnalytics = require('eventAnalytics'); // Assuming this is the required module

/**
 * Matches the requested command with the available service command.
 * @param {string} requestedCommand - The command requested by the user.
 * @return {Promise} A Promise that resolves to an object containing the matching service command, or rejects with a reprompt type exception if no matching command is found.
**/
function commandMatcher(requestedCommand) {
  const defer = q.defer();
  const lowerCaseCommand = _.toLower(requestedCommand || '');
  const serviceCommand = commandLib.transport[lowerCaseCommand];

  if (!serviceCommand) {
    log.error(`matcher.command - Did not find command match for "${requestedCommand}"`);
    defer.reject({ type: 'reprompt', exception: 'commandNoMatch' });
  } else {
    defer.resolve({ avCommand: serviceCommand });
  }

  eventAnalytics.event().sendTime('Matching', 'command.commandMatcher');
  return defer.promise;
}

module.exports = {
  commandMatcher,
};