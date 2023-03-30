const matcher = require('../lib/matchers/zone');
const action = require('../lib/actionLib');
const eventAnalytics = require('../lib/eventAnalytics');

const intentDictionary = {
  name: 'muteOff',
  version: '1.0',
  description: 'Send Mute On to requested zone',
  enabled: true,
};

module.change_code = 1;

function sendUnmuteCommand(req, res) {
  const a = new eventAnalytics.event(intentDictionary.name);

  if (!req.slot('ZONE')) { // Service Case
    return matcher.activeServiceNameMatcher(req.slot('SERVICE'))
      .then((cleanZones) => {
        action.muteCommand(cleanZones, 'off'); // Send mute command to all cleanZones
        return cleanZones;
      })
      .then((cleanZones) => {
        const voiceMessage = 'Unmute';
        console.log(`${intentDictionary.name} Intent: ${voiceMessage} Note: ()`);
        res.say(voiceMessage).send();
        a.sendAV([cleanZones, req.slot('SERVICE'), 'MuteOff']);
      })
      .catch((err) => {
        console.log(`${intentDictionary.name} Intent: ${err.message} Note: ()`);
        res.say(err.message).send();
      });
  }

  // Zone Case
  return matcher.multi(req.slot('ZONE'), req.slot('ZONE_TWO')).then((cleanZones) => {
    action.muteCommand(cleanZones, 'off'); // Send unmute command to all cleanZones
    return cleanZones;
  }).then((cleanZones) => {
    const voiceMessage = 'Unmute';
    console.log(`${intentDictionary.name} Intent: ${voiceMessage} Note: ()`);
    res.say(voiceMessage).send();
    a.sendAV([cleanZones, 'Zone', 'MuteOff']);
  }).catch((err) => {
    console.log(`${intentDictionary.name} Intent: ${err.message} Note: ()`);
    res.say(err.message).send();
  });
}

function handleMuteOffIntent(app, callback) {
  if (intentDictionary.enabled) {
    app.intent('muteOff', {
      slots: {
        ZONE: 'ZONE',
        ZONE_TWO: 'ZONE_TWO',
        SERVICE: 'SERVICE',
      },
      utterances: [
        '{to |} {send |} unmute {command |}{in |} {-|ZONE}',
        '{-|ZONE} unmute',
        '{to |} {send |} unmute {command |}{in |} {-|ZONE} and {-|ZONE_TWO}',
        '{-|ZONE} and {-|ZONE_TWO} unmute',
        '{to |} unmute {-|SERVICE}',
        '{-|SERVICE} {to |} unmute',
      ],
    }, sendUnmuteCommand);
  }

  callback(intentDictionary);
}

module.exports = handleMuteOffIntent;