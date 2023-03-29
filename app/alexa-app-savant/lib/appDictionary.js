const zoneParse = require('./zoneParse');
const savantLib  = require('./savantLib');
const commandLib = require('./commandLib.json');
const _ = require('lodash');
const eventAnalytics = require('./eventAnalytics');

const appDictionaryArray = [];
const zoneServices = {};

module.exports = function(app){
  app.dictionary = {
    "movementPrompt": ["move", "tell", "send", "ask"],
    "speedPrompt": ["high", "medium", "low", "on", "off"],
    "applicationType": ["channel", "motor", "shade", "blind"],
    "scenePrompt": ["run", "execute", "play"],
    "openMovementPrompt": ["open", "lift", "raise"],
    "closeMovementPrompt": ["close", "drop", "lower"],
    "hvacSystemPrompt": ["HVAC", "A.C.", "H.V.A.C.", "house", "system"],
    "hvacModes": ["Heat", "Cool", "AC", "Off", "On", "auto"],
    "actionPrompt": ["Turn", "Set", "Switch", "Power", "Start"],
    "disablePrompt": ["disable", "turn off", "stop"],
    "enablePrompt": ["enable", "turn on", "start", "I want to Listen to", "I want to watch", "switch"],
    "rangePrompt": ["High", "Hi", "Medium", "Low"],
    "increasePrompt": ["raise", "increase", "turn up"],
    "decreasePrompt": ["lower", "decrease", "turn down"],
    "lightingPrompt": ["Lights", "Light", "lighting"],
    "thingPrompt": ["tv", "speakers", "video", "audio", "music"],
    "serviceCommands": _.keys(commandLib),
    "channelAction": ["Switch", "tune", "change"],
    "sceneAction": ["recall", "activate"]
  };

  zoneParse.getZoneOrganization(globalZoneOrganization)
    .then(function(groupDictionary) {
      console.error("Building group list...");
      app.dictionary.systemGroupNames = groupDictionary[1];
      app.dictionary.systemGroups = groupDictionary[0];
      appDictionaryGroups = groupDictionary[0];
      appDictionaryGroupArray = _.values(app.dictionary.systemGroupNames);
      appDictionaryGroupArrayLowerCase = _.map(appDictionaryGroupArray, function(item) { return _.toLower(item); });
    })
    .then(zoneParse.getZones.bind(null, serviceOrderPlist))
    .then(function(systemZones) {
      console.error("Building zone list...");
      app.dictionary.systemZones = systemZones;
      appDictionaryArray = _.values(app.dictionary.systemZones);
      appDictionaryArrayLowerCase = _.map(appDictionaryArray, function(item) { return _.toLower(item); });
    })
    .then(zoneParse.getZoneServices.bind(null, serviceOrderPlist))
    .then (function(foundservices) {
      console.error("Building service array library...");
      systemServices = foundservices;
    })
    .then(zoneParse.getServiceNames.bind(null, serviceOrderPlist))
    .then (function(ret) {
      console.error("Building service name list...");
      app.dictionary.sourceComponents = ret.sourceComponent;
      app.dictionary.serviceAlias = ret.serviceAlias;
      app.dictionary.services = ret.serviceAlias.concat(ret.sourceComponent);
      appDictionaryServiceNameArray = _.values(app.dictionary.services);
    })
    .then(zoneParse.getChannels.bind(null, channelsByService))
    .then (function(channelsByService){
      console.error("Building favorite channel library...");
      appDictionaryChannels = channelsByService[0];
      appDictionaryChannelsArray = channelsByService[1];
    })
    .then(function() {
      if (app.environment.sceneSupport) {
        console.error("Building Scene list...");
        savantLib.getSceneNames()
        .then(function(ret) {
          const scenes = _.uniq(_.keys(ret)).map(key => key.replace(/[0-9]/g, ''));
          app.dictionary.sceneExample = scenes;
        });
      } else {
        console.error("Building Scene list...Skipping Running Savant version " + app.environment.version);
      }
    })
    .then (function(){
      console.error("Building customSlotFile...");
      require('./customSlotFile')(app);
      console.error("Loading User Presets...");
      require('./userPresets')(app);
      eventAnalytics.systemAnalytics();
    });
};