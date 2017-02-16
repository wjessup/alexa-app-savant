'use strict';

const
  ua = require('universal-analytics'),
  _ = require('lodash'),
  uuidV4 = require('uuid/v4'),
  fs = require('fs'),
  path = require('path'),
  plist = require('simple-plist'),
  q = require('q'),
  os = require('os');

var userAction;
var newUser;
var userInfo;
var userInfoFile = path.resolve(__dirname,'../userFiles/userInfo.plist');
var skillPackageFile = path.resolve(__dirname,'../../../package.json');
var skillPackage = require(skillPackageFile);


getUUID()
.then(function (userInfo) {
  if (allowAnonymousData){
    startUA()
    userAction.event({ec: "alexa", ea: "Skill Boot", el: skillPackage.version}).send();
    if (newUser === 1){
      console.log("New UUID Created: "+userInfo.uuid);
      userAction.event({ec: "User Created",ea: "User Created" }).send();
    }else{
      console.log("Using Existing UUID: "+userInfo.uuid);
    }
  }else{
    startUA()
    if (newUser === 1){
      console.log("New UUID Created: "+userInfo.uuid);
      userAction.event({ec: "Blocked User", ea: "Blocked User" }).send();
    }
  }
})
.fail(function (err){
  console.log("i got an error: "+err);
});

class event {
  constructor(itent) {
    this.intent = itent;
    this.refTime = +new Date();
  }

  sendEvent(eventData) {//eventData = [ec,ea,el,ev]
    let time = +new Date();
    let eventDataStructured = {
      ec: eventData[0],
      ea: eventData[1],
      el: eventData[2],
      ev: null
    };
    if (!eventData[3]){
      eventDataStructured.ev = time - this.refTime;
    } else{
      eventDataStructured.ev = eventData[3];
    }
    if (allowAnonymousData){
      userAction.event(eventDataStructured)
    }
  }
  sendError(eventData) { //eventData = string
    if (allowAnonymousData){
      let time = +new Date();
      userAction.exception(eventData).send();
    }
  }
  sendTime(eventData) { //eventData = [cat,disc]
    if (allowAnonymousData){
      let time = +new Date();
      userAction.timing(eventData[0],eventData[1],time - this.refTime).send();
    }
  }

  sendAV(eventData){ //eventData = [cleanZones, service, command, volume]
    this.zones = eventData[0];
    this.service = eventData[1];
    this.command = eventData[2];
    this.volumeLevel = eventData[3];

    this.sendEvent(["userAction Type","AV",this.intent]);
    this.processIntent();
    this.processZones();
    this.processService();
    this.processCommand();
    this.processVolumeLevel();
  }
  sendLighting(eventData){ //eventData = [cleanZones, lightingLevel, lightingSlot]
    this.zones = eventData[0];
    this.service = "Zone";
    this.command = "__RoomSetBrightness";
    this.lightingLevel = eventData[1];
    this.lightingSlot = eventData[2];

    this.sendEvent(["userAction Type","Lighting",this.intent]);
    this.processIntent();
    this.processZones();
    this.processService();
    this.processCommand();
    this.processLightingLevel();
    this.processLightingSlot();
  }
  sendHVAC(eventData){ //eventData = [EA, EL,Command]
    this.hvacEA = eventData[0];
    this.hvacEL = eventData[1];
    this.command = eventData[0];

    this.sendEvent(["userAction Type","HVAC",this.intent]);
    this.processIntent();
    this.processCommand();
    this.processHVAC();
  }
  sendAlexa(eventData){ //eventData = [EA, EL,EV]
    this.alexaEA = eventData[0];
    this.alexaEL = eventData[1];
    this.alexaEV = eventData[2];

    this.sendEvent(["userAction Type","alexa",this.intent]);
    this.processIntent();
    this.processAlexa();
  }
  sendSleep(eventData){ //eventData = [cleanZones,command,Sleep Time]
    this.zones = eventData[0];
    this.service = "sleepTimer";
    this.command = eventData[1];
    this.sleepTime = eventData[2];

    this.sleepEA = eventData[0];
    this.sleepEL = eventData[1];
    this.sleepEV = eventData[2];

    this.sendEvent(["userAction Type","Sleep Timer",this.intent]);
    this.processIntent();
    this.processZones();
    this.processService();
    this.processCommand();
    this.processSleep();
  }

  processIntent(){
    this.sendEvent(["Intent",this.intent]);
    this.sendTime(["Intent",this.intent]);
  }
  processService(){
    this.sendEvent(["Service",this.service,this.intent]);
  }
  processCommand(){
    if (this.command){
      this.sendEvent(["Command",this.command,this.intent]);
    }
  }
  processVolumeLevel(){
    if (this.volumeLevel){
      if (this.volumeLevel.type === "set"){
        this.sendEvent(["Volume Level","Set",this.volumeLevel.value]);
      }else if (this.volumeLevel.type === "adjust"){
        this.sendEvent(["Volume Level","Adjust",this.volumeLevel.value]);
      }else{
        console.log('mis-used type')
      }
    }
  }
  processLightingLevel(){
    this.sendEvent(["Lighting Level","Set",this.lightingLevel]);
  }
  processLightingSlot(){
    this.sendEvent(["Lighting",this.lightingSlot,this.intent]);
  }
  processHVAC(){
    this.sendEvent(["HVAC",this.hvacEA,this.hvacEL]);
  }
  processAlexa(){
    this.sendEvent(["alexa",this.alexaEA,this.alexaEL,this.alexaEV]);
  }
  processSleep(){
    this.sendEvent(["Sleep Timer",this.command,this.sleepTime,this.sleepEV]);
  }
  processZones(){
    //cleanZones
    for (var key of this.zones[0]){
      this.sendEvent(["Zone Name",key,this.intent]);
    }
    if (this.zones[0].length > 1){
      this.sendEvent(["Zone Request","Multi",this.intent,this.zones[0].length]);
    }else{
      this.sendEvent(["Zone Request","Single",this.intent,this.zones[0].length]);
    }
    if (this.zones[0].length != this.zones[1].length){
      this.sendEvent(["Zone Type","Group",this.intent,this.zones[0].length]);
    }else{
      this.sendEvent(["Zone Type","Single Zone",this.intent,this.zones[0].length]);
    }
  }

}

function startUA(){
  userAction = ua('UA-43924133-7', userInfo.uuid).debug();
}
/*
function OLDsend(intent,zones,service,command,range,percent,lighting,timer,temp,mode){
  if (allowAnonymousData){
    if (intent) {
      userAction.event({ec: "Intent",ea: intent}).send();
    }
    if (zones) {
      for (var key in zones[0]){
        userAction.event({ec: "Zone Name",ea: zones[0][key],el: intent}).send();
      }
      if (zones[0][1]){
        userAction.event({ec: "Zone Request",ea: "Multi",el: intent,ev: zones[0].length}).send();
      }else{
        userAction.event({ec: "Zone Request",ea: "Single",el: intent,ev: zones[0].length}).send();
      }
      if (zones[0].length != zones[1].length){
        userAction.event({ec: "Zone Type",ea: "Group",el: intent,ev: zones[0].length}).send();
      }else{
        userAction.event({ec: "Zone Type",ea: "Single Zone",el: intent,ev: zones[0].length}).send();
      }
    }
    if (service) {
      userAction.event({ec: "Service",ea: service,el: intent}).send();
    }
    if (command) {
      userAction.event({ec: "Command",ea: command,el: intent}).send();
    }
    if (percent) {
      userAction.event({ec: "Percent",ea: percent,ev: percent,el: intent}).send();
    }
    if (lighting) {
      userAction.event({ec: "Lighting",ea: lighting,el: intent}).send();
      userAction.event({ec: "userAction Type",ea: "Lighting",el: intent}).send();
    }
    if (timer) {
      userAction.event({ec: "Timer",ea: timer,ev: timer,el: intent}).send();
    }
    if (temp) {
      userAction.event({ec: "HVAC Temperature",ea: temp,ev: temp,el: intent}).send();
    }
    if (mode) {
      userAction.event({ec: "HVAC Mode",ea: mode,el: intent}).send();
    }
  }
}
*/


function getUUID(){
  var defer = q.defer();
  if (fs.existsSync(userInfoFile)) {
    userInfo = plist.readFileSync(userInfoFile);
    //console.log("User identifier: "+userInfo.uuid);
    if (!userInfo.uuid){
      newUser = 1;
      userInfo.uuid = uuidV4();
      plist.writeFileSync(userInfoFile, userInfo);
    }
    defer.resolve(userInfo);
  }else{
    newUser = 1;
    userInfo = {};
    userInfo.uuid = uuidV4();
    plist.writeFileSync(userInfoFile, userInfo);
    defer.resolve(userInfo);
  }
  return defer.promise;
}

function systemAnalytics(){
  if (allowAnonymousData){
    switch (os.platform()){
      case "darwin":
        var ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
        break;
      case "linux":
        var ua = "Mozilla/5.0 (X11; Linux i686) AppleWebKit/535.1 (KHTML, like Gecko) Debian Chrome/41.0.2272.118 Safari/535.1"
        break;
    }
    userAction.set("an", "alexa-app-savant");
    userAction.set("av", skillPackage.version);
    userAction.set("ua", ua);

    if (!userInfo.systemInfo){
      userInfo.systemInfo = {};
      plist.writeFileSync(userInfoFile, userInfo);
    }
    if (userInfo.systemInfo.Zones != appDictionaryArray.length){
      userInfo.systemInfo.Zones = appDictionaryArray.length
      userAction.event({ec: "System Size",ea: "Number of Zones", ev: appDictionaryArray.length}).send();
      plist.writeFileSync(userInfoFile, userInfo);
    }
    if (userInfo.systemInfo.Groups != appDictionaryGroupArray.length){
      userInfo.systemInfo.Groups = appDictionaryGroupArray.length
      userAction.event({ec: "System Size",ea: "Number of Groups", ev: appDictionaryGroupArray.length}).send();
      plist.writeFileSync(userInfoFile, userInfo);
    }
    if (userInfo.systemInfo.Services != appDictionaryServiceNameArray.length){
      userInfo.systemInfo.Services = appDictionaryServiceNameArray.length
      userAction.event({ec: "System Size",ea: "Number of Services", ev: appDictionaryServiceNameArray.length}).send();
      plist.writeFileSync(userInfoFile, userInfo);
    }
    if (userInfo.skillVersion != skillPackage.version){
      userInfo.skillVersion = skillPackage.version
      plist.writeFileSync(userInfoFile, userInfo);
    }
  }
}

module.exports = {
  event,
  //OLDsend:OLDsend,
  systemAnalytics:systemAnalytics
}
