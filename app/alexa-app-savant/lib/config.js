module.change_code = 1;
const os = require('os');

//Skill Name
skillName = "savant";

//Custom workflow location: customWorkflowScope = ["<<Zone Name>>","<<Host Name>>"];
customWorkflowScope = ["Dining Room","Greentree"];

//Thermostat Scope - set this to match the scope of your stat
tstatScope = ["Family Room","Savant SSTW100","HVAC_controller","1","SVC_ENV_HVAC","1"];

//Savant config stuff, Determines if its on a pro or smart host then sets dirs. no real reason to change any of this.
switch (os.platform()){
  case "darwin":
    appLocation = process.env['HOME'];
    sclibridgePath = "/Users/RPM/Applications/RacePointMedia/sclibridge";
    racepointfolder = "/Users/RPM/Library/Application Support/RacePointMedia";
    savePath = racepointfolder+"/statusfiles/";
    configPath = racepointfolder+"/userConfig.rpmConfig";

    //config file locations
    zoneInfo = configPath+"/zoneInfo.plist";
    serviceOrderPlist = configPath+"/serviceOrder.plist";
    break;
  case "linux":
    appLocation = process.env['HOME'];
    sclibridgePath = "/usr/local/bin/sclibridge";
    racepointfolder = "/home/RPM/GNUstep/Library/ApplicationSupport/RacePointMedia";
    savePath = racepointfolder+"/statusfiles/";
    configPath = racepointfolder+"/userConfig.rpmConfig";

    //config file locations
    zoneInfo = configPath+"/zoneInfo.plist";
    serviceOrderPlist = configPath+"/serviceOrder.plist";
    break;
}
