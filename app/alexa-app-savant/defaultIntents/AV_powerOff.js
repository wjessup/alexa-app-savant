const zoneParse = require('./zoneParse'),
      savantLib = require('./savantLib'),
      commandLib = require('./commandLib.json'),
      _ = require('lodash'),
      eventAnalytics = require('./eventAnalytics');

let appDictionaryArray = [];
let zoneServices = {};

module.exports = async function(app) {
    app.dictionary = {
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
        enablePrompt: ["enable", "turn on", "start", "I want to Listen to", "I want to watch", "switch"],
        rangePrompt: ["High", "Hi", "Medium", "Low"],
        increasePrompt: ["raise", "increase", "turn up"],
        decreasePrompt: ["lower", "decrease", "turn down"],
        lightingPrompt: ["Lights", "Light", "lighting"],
        thingPrompt: ["tv", "speakers", "video", "audio", "music"],
        serviceCommands: _.keys(commandLib),
        channelAction: ["Switch", "tune", "change"],
        sceneAction: ["recall", "activate"]
    }

    const groupDictionary = await zoneParse.getZoneOrganization(globalZoneOrganization);
    app.dictionary.systemGroupNames = groupDictionary[1];
    app.dictionary.systemGroups = groupDictionary[0];
    let appDictionaryGroups = groupDictionary[0];
    let appDictionaryGroupArray = _.values(app.dictionary.systemGroupNames);
    let appDictionaryGroupArrayLowerCase = _.map(appDictionaryGroupArray, item => _.toLower(item));

    const systemZones = await zoneParse.getZones(serviceOrderPlist);
    app.dictionary.systemZones = systemZones;
    appDictionaryArray = _.values(app.dictionary.systemZones);
    let appDictionaryArrayLowerCase = _.map(appDictionaryArray, item => _.toLower(item));

    const foundservices = await zoneParse.getZoneServices(serviceOrderPlist);
    let systemServices = foundservices;

    const ret = await zoneParse.getServiceNames(serviceOrderPlist);
    app.dictionary.sourceComponents = ret.sourceComponent;
    app.dictionary.serviceAlias = ret.serviceAlias;
    app.dictionary.services = ret.serviceAlias.concat(ret.sourceComponent);
    let appDictionaryServiceNameArray = _.values(app.dictionary.services);

    const channelsByService = await zoneParse.getChannels(channelsByService);
    let appDictionaryChannels = channelsByService[0];
    let appDictionaryChannelsArray = channelsByService[1];

    if (app.environment.sceneSupport) {
        const scenes = await savantLib.getSceneNames();
        for (const key in scenes) {
            scenes[key] = scenes[key].replace(/[0-9]/g, '');
        }
        app.dictionary.sceneExample = scenes;
    }

    require('./customSlotFile')(app);
    require('./userPresets')(app);
    eventAnalytics.systemAnalytics();
};