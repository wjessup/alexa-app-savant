const eventAnalytics = require('../lib/eventAnalytics');

module.exports = app => {
  const intentDictionary = {
    name: 'reboot',
    version: '3.0',
    description: 'Reboot alexa-app-savant skill',
    enabled: true,
    required: {
      resolve: [],
      test: {},
      failMessage: []
    },
    voiceMessages: {
      success: "I'll be back"
    },
    slots: {},
    utterances: ['load intents']
  };

  if (intentDictionary.enabled) {
    app.intent(
      intentDictionary.name,
      { slots: intentDictionary.slots, utterances: intentDictionary.utterances },
      async (req, res) => {
        const a = new eventAnalytics.event(intentDictionary.name);
        try {
          const [, stdout, stderr] = await asyncExec('pm2 restart all --update-env');
          log.debug('Reboot Response: ' + stdout);
          log.error(intentDictionary.name + ' Intent: ' + intentDictionary.voiceMessages.success);
          res.say(intentDictionary.voiceMessages.success).send();
          a.sendAlexa(['reboot', '']);
        } catch (error) {
          log.error(error);
          res.say('Sorry, something went wrong').send();
        }
      }
    );
  }
  return intentDictionary;
};