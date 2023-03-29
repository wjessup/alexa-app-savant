const zoneParse = require('./zoneParse');
const savantLib = require('./savantLib');
const commandLib = require('./commandLib.json');
const _ = require('lodash');
const eventAnalytics = require('./eventAnalytics');

let appDictionaryArray = [];
let zoneServices = {};

module.exports = function(app) {
  app.dictionary = {
    // ... Add all properties from above
    "sceneAction" : ["recall","activate"]
  };

  async function initialize() {
    try {
      const groupDictionary = await zoneParse.getZoneOrganization(globalZoneOrganization);
      const systemZones = await zoneParse.getZones(serviceOrderPlist);
      const foundservices = await zoneParse.getZoneServices(serviceOrderPlist);
      const ret = await zoneParse.getServiceNames(serviceOrderPlist);
      const channelsByService = await zoneParse.getChannels(channelsByService);

      app.dictionary.systemGroupNames = groupDictionary[1];
      app.dictionary.systemGroups = groupDictionary[0];
      app.dictionary.systemZones = systemZones;
      app.dictionary.sourceComponents = ret.sourceComponent;
      app.dictionary.serviceAlias = ret.serviceAlias;
      app.dictionary.services = ret.serviceAlias.concat(ret.sourceComponent);

      if (app.environment.sceneSupport) {
        const scenes = await savantLib.getSceneNames();
        app.dictionary.sceneExample = scenes.map(scene => scene.replace(/[0-9]/g, '')).filter((value, index, self) => self.indexOf(value) === index);
      }

      require('./customSlotFile')(app);
      require('./userPresets')(app);
      eventAnalytics.systemAnalytics();
      
    } catch(error) {
      console.error('Error initializing app: ', error);
    }
  }

  initialize();
};