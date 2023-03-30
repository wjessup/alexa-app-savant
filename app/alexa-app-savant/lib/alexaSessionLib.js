const _ = require('lodash');
const zoneParse = require('./zoneParse');
const savantLib = require('./savantLib');
const eventAnalytics = require('./eventAnalytics');

let appDictionaryArray = [];
let zoneServices = {};
let appDictionaryGroups = {};
let appDictionaryGroupArray = [];
let appDictionaryGroupArrayLowerCase = [];
let appDictionaryServiceNameArray = [];
let appDictionaryChannels = {};
let appDictionaryChannelsArray = [];

const getDictionary = () => {
  return {
    movementPrompt: ["move", "tell", "send", "ask"],
    speedPrompt: ["high", "medium", "low", "on", "off"],
    applicationType: ["channel", "motor", "shade", "blind"],
    scenePrompt: ["run", "execute", "play"],
    openMovementPrompt: ["open", "lift", "raise"],
    closeMovementPrompt: ["close", "drop", "lower"],
    hvacSystemPrompt: ["HVAC", "A.C.", "H.V.A.C.", "house", "system"],
    hvacModes: ["Heat", "Cool", "AC", "Off", "On", "auto"],
    actionPrompt: ["Turn", "Set", "Switch", "Power", "Start"],
    disablePrompt: ["disable", "turn off", "stop"],
    enablePrompt: [
      "enable",
      "turn on",
      "start",
      "I want to Listen to",
      "I want to watch",
      "switch",
    ],
    rangePrompt: ["High", "Hi", "Medium", "Low"],
    increasePrompt: ["raise", "increase", "turn up"],
    decreasePrompt: ["lower", "decrease", "turn down"],
    lightingPrompt: ["Lights", "Light", "lighting"],
    thingPrompt: ["tv", "speakers", "video", "audio", "music"],
    serviceCommands: _.keys(require('./commandLib.json')),
    channelAction: ["Switch", "tune", "change"],
    sceneAction: ["recall", "activate"],
  };
};

const getZoneOrganization = () => {
  return zoneParse.getZoneOrganization(globalZoneOrganization).then((groupDictionary) => {
    appDictionaryGroups = groupDictionary[0];
    appDictionaryArray = _.values(groupDictionary[1]);
    appDictionaryGroupArrayLowerCase = _.map(appDictionaryArray, (item) => _.toLower(item));
  });
};

const getZones = () => {
  return zoneParse.getZones(serviceOrderPlist).then((systemZones) => {
    appDictionaryArray = _.values(systemZones);
    appDictionaryArrayLowerCase = _.map(appDictionaryArray, (item) => _.toLower(item));
  });
};

const getZoneServices = () => {
  return zoneParse.getZoneServices(serviceOrderPlist).then((foundservices) => {
    systemServices = foundservices;
  });
};

const getServiceNames = () => {
  return zoneParse.getServiceNames(serviceOrderPlist).then((ret) => {
    appDictionaryServiceNameArray = _.values(ret.serviceAlias.concat(ret.sourceComponent));
  });
};

const getChannels = () => {
  return zoneParse.getChannels(channelsByService).then((channelsByService) => {
    appDictionaryChannels = channelsByService[0];
    appDictionaryChannelsArray = channelsByService[1];
  });
};

const buildSceneList = () => {
  if (app.environment.sceneSupport) {
    return savantLib.getSceneNames().then((ret) => {
      let scenes = _.uniq(_.keys(ret));
      for (let key in scenes) {
        scenes[key] = scenes[key].replace(/[0-9]/g, "");
      }
      return scenes;
    });
  }
  return Promise.reject(new Error("Skipping retrieving scenes"));
};

const customSlotFile = () => {
  require('./customSlotFile')(app);
};

const loadUserPresets = () => {
  require('./userPresets')(app);
};

module.exports = (app) => {
  app.dictionary = getDictionary();
  getZoneOrganization().then(getZones).then(getZoneServices).then(getServiceNames).then(getChannels).then(() => {
    buildSceneList()
      .then((scenes) => {
        app.dictionary.sceneExample = scenes;
        customSlotFile();
        loadUserPresets();
        eventAnalytics.systemAnalytics();
      })
      .catch((e) => {
        console.log(`Error: ${e.message}`);
      });
  });
};