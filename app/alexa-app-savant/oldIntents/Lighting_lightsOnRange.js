const os = require('os');

// Skill Name
const skillName = 'savant';

//Single zone mode - set the name of the zone you want as the primary zone
const currentZone = {
  actionable: [false],
  speakable: [false]
};

// Custom Workflow location
const customWorkflowScope = ['Dining Room', 'Greentree'];

// Thermostat Scope - set this to match the scope of your stat
const tstatScope = [
  'Family Room',
  'Savant SSTW100',
  'HVAC_controller',
  '1',
  'SVC_ENV_HVAC',
  '1'
];

// Share anonymous data.
let allowAnonymousData = true;

// Savant config. Determines if it's on a pro or smart host then sets dirs. No real reason to change any of this.
let appLocation;
let sclibridgePath;
let racepointfolder;
let savePath;
let configPath;
let zoneInfo;
let serviceOrderPlist;
let globalZoneOrganization;
let channelsByService;
let documentInfo;

switch (os.platform()) {
  case 'darwin':
    appLocation = process.env.HOME;
    sclibridgePath =
      '/Users/RPM/Applications/RacePointMedia/sclibridge';
    racepointfolder =
      '/Users/RPM/Library/Application Support/RacePointMedia';
    savePath = `${racepointfolder}/statusfiles/`;
    configPath = `${racepointfolder}/userConfig.rpmConfig`;

    // Config file locations
    zoneInfo = `${configPath}/zoneInfo.plist`;
    serviceOrderPlist = `${configPath}/serviceOrder.plist`;
    globalZoneOrganization = `${configPath}/globalZoneOrganization.plist`;
    channelsByService = `${configPath}/channelsByService.plist`;
    documentInfo = `${configPath}/documentInfo.plist`;
    break;

  case 'linux':
    appLocation = process.env.HOME;
    sclibridgePath = '/usr/local/bin/sclibridge';
    racepointfolder =
      '/home/RPM/GNUstep/Library/ApplicationSupport/RacePointMedia';
    savePath = `${racepointfolder}/statusfiles/`;
    configPath = `${racepointfolder}/userConfig.rpmConfig`;

    // Config file locations
    zoneInfo = `${configPath}/zoneInfo.plist`;
    serviceOrderPlist = `${configPath}/serviceOrder.plist`;
    globalZoneOrganization = `${configPath}/globalZoneOrganization.plist`;
    channelsByService = `${configPath}/channelsByService.plist`;
    break;

  default:
    throw new Error('Unsupported platform: ' + os.platform());
}

module.exports = {
  skillName,
  currentZone,
  customWorkflowScope,
  tstatScope,
  allowAnonymousData,
  appLocation,
  sclibridgePath,
  racepointfolder,
  savePath,
  configPath,
  zoneInfo,
  serviceOrderPlist,
  globalZoneOrganization,
  channelsByService,
  documentInfo
};