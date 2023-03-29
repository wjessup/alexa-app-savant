// Imported libraries and files
const
    zoneParse = require('./zoneParse'),
    savantLib  = require('./savantLib'),
    commandLib = require('./commandLib.json'),
    _ = require('lodash'),
    eventAnalytics = require('./eventAnalytics');

module.exports = function(app) {
    initialize(app);
};

function initialize(app) {
    // Initialize dictionary
    app.dictionary = createDictionary();

    // Build components
    buildGroupList(app)
        .then(() => buildZoneList(app))
        .then(() => buildServiceLibrary(app))
        .then(() => buildServiceNameList(app))
        .then(() => buildFavoriteChannelsLibrary(app))
        .then(() => buildSceneList(app))
        .then(() => {
            // Load customSlotFile
            require('./customSlotFile')(app);
            // Load User Presets
            require('./userPresets')(app);
            // Load system analytics
            eventAnalytics.systemAnalytics();
        });
}

function createDictionary() {
    return {
        "movementPrompt": ["move", "tell", "send", "ask"],
        // ... (other dictionary keys and values)
        "sceneAction": ["recall", "activate"]
    };
}

function buildGroupList(app) {
    return zoneParse.getZoneOrganization(globalZoneOrganization)
        .then(function (groupDictionary) {
            app.dictionary.systemGroupNames = groupDictionary[1];
            app.dictionary.systemGroups = groupDictionary[0];
            appDictionaryGroupArray = _.values(app.dictionary.systemGroupNames);
            appDictionaryGroupArrayLowerCase = _.map(appDictionaryGroupArray, _.toLower);
        });
}

function buildZoneList(app) {
    return zoneParse.getZones(serviceOrderPlist)
        .then(function (systemZones) {
            app.dictionary.systemZones = systemZones;
            appDictionaryArray = _.values(app.dictionary.systemZones);
            appDictionaryArrayLowerCase = _.map(appDictionaryArray, _.toLower);
        });
}

function buildServiceLibrary(app) {
    return zoneParse.getZoneServices(serviceOrderPlist)
        .then(function (foundservices) {
            systemServices = foundservices;
        });
}

function buildServiceNameList(app) {
    return zoneParse.getServiceNames(serviceOrderPlist)
        .then(function (ret) {
            app.dictionary.sourceComponents = ret.sourceComponent;
            app.dictionary.serviceAlias = ret.serviceAlias;
            app.dictionary.services = ret.serviceAlias.concat(ret.sourceComponent);
            appDictionaryServiceNameArray = _.values(app.dictionary.services);
        });
}

function buildFavoriteChannelsLibrary(app) {
    return zoneParse.getChannels(channelsByService)
        .then(function (channelsByService) {
            appDictionaryChannels = channelsByService[0];
            appDictionaryChannelsArray = channelsByService[1]
        });
}

function buildSceneList(app) {
    if (app.environment.sceneSupport) {
        return savantLib.getSceneNames()
            .then(function (ret) {
                const scenes = _.uniq(_.keys(ret)).map(scene => scene.replace(/[0-9]/g, ''));
                app.dictionary.sceneExample = scenes;
            });
    } else {
        log.error("Building Scene list...Skipping Running Savant version " + app.environment.version)
        return Promise.resolve();
    }
}