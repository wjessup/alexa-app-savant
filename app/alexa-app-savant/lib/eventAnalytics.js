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
      log.error("New UUID Created: "+userInfo.uuid);
      userAction.event({ec: "User Created",ea: "User Created" }).send();
    }else{
      log.error("Using Existing UUID: "+userInfo.uuid);
    }
  }else{
    startUA()
    if (newUser === 1){
      log.error("New UUID Created: "+userInfo.uuid);
      userAction.event({ec: "Blocked User", ea: "Blocked User" }).send();
    }
  }
})
.fail(function (err){
  log.error("i got an error: "+err);
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

  /*sendTimeOLD(eventData) { //eventData = [cat,disc]
    if (allowAnonymousData){
      if (!eventData[1]){
        eventData[1] = this.intent;
      }
      let time = +new Date();
      userAction.timing(eventData[0],eventData[1],time - this.refTime).send();
    }
  }
  */
  sendTime(tc,tv) {
    if (allowAnonymousData){
      if (tv){
        var tv = this.intent;
      }
      let time = +new Date();
      userAction.timing(tc,tv,time - this.refTime).send();
    }
  }
  sendTimeManual(tc,startTime) {
    if (allowAnonymousData){
      var tv = this.intent;

      let time = +new Date();
      userAction.timing(tc,tv,time - startTime).send();
    }
  }

  sendAV(eventData){ //eventData = [cleanzone, service, command, volume]
    this.zone = eventData[0];
    this.service = eventData[1];
    this.command = eventData[2];
    this.volumeLevel = eventData[3];

    this.sendEvent(["userAction Type","AV",this.intent]);
    this.processIntent();
    this.processzone();
    this.processService();
    this.processCommand();
    this.processVolumeLevel();
  }
  sendLighting(eventData){ //eventData = [cleanzone, lightingLevel, lightingSlot]
    this.zone = eventData[0];
    this.service = "Zone";
    this.command = "__RoomSetBrightness";
    this.lightingLevel = eventData[1];
    this.lightingSlot = eventData[2];

    this.sendEvent(["userAction Type","Lighting",this.intent]);
    this.processIntent();
    this.processzone();
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
  sendSleep(eventData){ //eventData = [cleanzone,command,Sleep Time]
    this.zone = eventData[0];
    this.service = "sleepTimer";
    this.command = eventData[1];
    this.sleepTime = eventData[2];

    this.sleepEA = eventData[0];
    this.sleepEL = eventData[1];
    this.sleepEV = eventData[2];

    this.sendEvent(["userAction Type","Sleep Timer",this.intent]);
    this.processIntent();
    this.processzone();
    this.processService();
    this.processCommand();
    this.processSleep();
  }

  processIntent(){
    this.sendEvent(["Intent",this.intent]);
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
        log.error('mis-used type')
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
  processzone(){
    //cleanzone
    for (var key of this.zone.actionable){
      this.sendEvent(["Zone Name",key,this.intent]);
    }
    if (this.zone.actionable.length > 1){
      this.sendEvent(["Zone Request","Multi",this.intent,this.zone.actionable.length]);
    }else{
      this.sendEvent(["Zone Request","Single",this.intent,this.zone.actionable.length]);
    }
    if (this.zone.actionable.length != this.zone.speakable.length){
      this.sendEvent(["Zone Type","Group",this.intent,this.zone.actionable.length]);
    }else{
      this.sendEvent(["Zone Type","Single Zone",this.intent,this.zone.actionable.length]);
    }
  }
}

function startUA(){
  userAction = ua('UA-43924133-9', userInfo.uuid)//.debug();//UA-43924133-7
}

function getUUID(){
  var defer = q.defer();
  if (fs.existsSync(userInfoFile)) {
    userInfo = plist.readFileSync(userInfoFile);
    //log.error("User identifier: "+userInfo.uuid);
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
    if (userInfo.systemInfo.zone != appDictionaryArray.length){
      userInfo.systemInfo.zone = appDictionaryArray.length
      userAction.event({ec: "System Size",ea: "Number of zone", ev: appDictionaryArray.length}).send();
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
  event:event,
  systemAnalytics:systemAnalytics
}
