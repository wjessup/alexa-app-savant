const
  ua = require('universal-analytics'),
  uuidV4 = require('uuid/v4'),
  fs = require('fs'),
  path = require('path'),
  plist = require('simple-plist'),
  q = require('q');

var userAction;
var newUser;

getUUID()
.then(function (userInfo) {
  if (allowAnonymousData){
    userAction = ua('UA-43924133-7', userInfo.uuid);
    userAction.event({
      ec: "Skill Boot",
      ea: "boot"
    }).send();
    if (newUser === 1){
      console.log("New UUID Created: "+userInfo.uuid);
      userAction.event({
        ec: "User Created",
        ea: "User Created"
      }).send();
    }else{
      console.log("Using Existing UUID: "+userInfo.uuid);
    }
  }else{
    userAction = ua('UA-43924133-7', userInfo.uuid);
    if (newUser === 1){
      console.log("New UUID Created: "+userInfo.uuid);
      userAction.event({
        ec: "Blocked User",
        ea: "Blocked User"
      }).send();
    }
  }
})
.fail(function (err){
  console.log("i got an error: "+err);
});

function send(intent,zones,service,command,range,percent,lighting,timer,temp,mode){
  if (allowAnonymousData){
    if (intent) {
      userAction.event({
        ec: "Intent",
        ea: intent
      }).send();
    }
    if (zones) {
      for (var key in zones[0]){
        userAction.event({
          ec: "Zone Name",
          ea: zones[0][key],
          el: intent
        }).send();
      }
      if (zones[0][1]){
        userAction.event({
          ec: "Zone Request",
          ea: "Multi",
          el: intent,
          ev: zones[0].length
        }).send();
      }else{
        userAction.event({
          ec: "Zone Request",
          ea: "Single",
          el: intent,
          ev: zones[0].length
        }).send();
      }
      if (zones[0].length != zones[1].length){
        userAction.event({
          ec: "Zone Type",
          ea: "Group",
          el: intent,
          ev: zones[0].length
        }).send();
      }else{
        userAction.event({
          ec: "Zone Type",
          ea: "Single Zone",
          el: intent,
          ev: zones[0].length
        }).send();
      }
    }
    if (service) {
      userAction.event({
        ec: "Service",
        ea: service,
        el: intent
      }).send();
    }
    if (command) {
      userAction.event({
        ec: "Command",
        ea: command,
        el: intent
      }).send();
    }
    if (percent) {
      userAction.event({
        ec: "Percent",
        ea: percent,
        ev: percent,
        el: intent
      }).send();
    }
    if (lighting) {
      userAction.event({
        ec: "Lighting",
        ea: lighting,
        el: intent
      }).send();
      userAction.event({
        ec: "userAction Type",
        ea: "Lighting",
        el: intent
      }).send();
    }
    if (timer) {
      userAction.event({
        ec: "Timer",
        ea: timer,
        ev: timer,
        el: intent
      }).send();
    }
    if (temp) {
      userAction.event({
        ec: "HVAC Temperature",
        ea: temp,
        ev: temp,
        el: intent
      }).send();
    }
    if (mode) {
      userAction.event({
        ec: "HVAC Mode",
        ea: mode,
        el: intent
      }).send();
    }
  }
}

function getUUID(){
  var defer = q.defer();
  var userInfoFile = path.resolve(__dirname,'../userFiles/userInfo.plist');
  if (fs.existsSync(userInfoFile)) {
    var userInfo = plist.readFileSync(userInfoFile);
    //console.log("User identifier: "+userInfo.uuid);
    if (!userInfo.uuid){
      newUser = 1;
      userInfo.uuid = uuidV4();
      plist.writeFileSync(userInfoFile, userInfo);
    }
    defer.resolve(userInfo);
  }else{
    newUser = 1;
    var userInfo = {};
    userInfo.uuid = uuidV4();
    plist.writeFileSync(userInfoFile, userInfo);
    defer.resolve(userInfo);
  }
  return defer.promise;
}

module.exports = {
  send:send
}
