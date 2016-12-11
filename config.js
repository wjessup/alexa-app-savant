module.change_code = 1;

//Skill Name
skillName = "Greentree";

//Custom workflow location: customWorkflowScope = ["<<Zone Name>>","<<Host Name>>"];
customWorkflowScope = ["Dining Room","Greentree"];

//Thermostat Scope - set this to match the scope of your stat
tstatScope = ["Family Room","Savant SSTW100","HVAC_controller","1","SVC_ENV_HVAC","1"];

//Savant config stull, no real reason to change any of this.
sclibridgePath = "/Users/RPM/Applications/RacePointMedia/sclibridge";
racepointfolder = "/Users/RPM/Library/Application Support/RacePointMedia";
savePath = racepointfolder+"/statusfiles/";
configPath = racepointfolder+"/userConfig.rpmConfig";
  //config file locations
    zoneInfo = configPath+"/zoneInfo.plist"
    serviceOrderPlist = configPath+"/serviceOrder.plist";
