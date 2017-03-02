'use strict';

const
  resolver  = require('./resolverLib'),
  voiceMessages = require('./voiceMessages.json'),
  intentRequired = require('./intentRequire.js'),
  _ = require('lodash'),
  q = require('q'),
  eventAnalytics = require('../lib/eventAnalytics');

module.exports = function(app){
  app.launch(function(req,res) {
  	res.say("BETA");
  });

  app.sessionEnded(function(req, res) {
  	log.error('session is over');
  	req.getSession().clear('listen');
  	res.shouldEndSession(true);
    //log.error(JSON.stringify(req))
    if (_.has(req.sessionAttributes,'aSession')){
      var a = new eventAnalytics.event(req.sessionAttributes.aSession.intent);
      a.sendTimeManual('session',req.sessionAttributes.aSession.refTime);
      if (!req.sessionAttributes.reprompt.count){
        req.sessionAttributes.reprompt.count = 0
      }
      a.sendEvent(["reprompt",req.sessionAttributes.aSession.intent,req.sessionAttributes.reprompt.count]);
    }
  });

  app.pre = function(req, res, reqType) {
    log.error("reqtype: "+reqType)
    if (reqType === "IntentRequest") {
      req.sessionAttributes.aSession = new eventAnalytics.event(req.data.request.intent.name);

      //log.debug(JSON.stringify(req));
      var reprompt = app.isReprompt(req);
      log.debug("app.pre - reprompt: "+reprompt)
      if (reprompt){
        req.data.request.intent.name = reprompt.initial.intent;
        _.mergeWith(req.data.request.intent.slots, reprompt.slots, mergeSlots);
      }

      if (!reprompt && _.get(req,'data.request.intent.name') === "zzzzCatchAll"){
        log.error("app.pre - catchall without reprompt");
        app.doReprompt("I did not understand, Please try again", req, res);
      }

      log.error("app.pre - running "+_.get(req, 'data.request.intent.name')+" intent");

    }
    if (req.getSession().get('listen')) {
      log.error("app.pre - keeping session open");
      res.shouldEndSession(false);
    }
  };

  app.post = function(req, res, reqType, ex) {
    if (!_.has(res, 'response.response.reprompt')) {
      _.unset(res, 'response.sessionAttributes.reprompt');
    }
    if (reqType === "IntentRequest" && _.has(req.sessionAttributes,'aSession')){
      req.sessionAttributes.aSession.sendTime('Intent');
    }

  };

  app.prep = function(req, res) {
    req.sessionAttributes.aPrep = new eventAnalytics.event(req.data.request.intent.name);
    var required = intentRequired.get(req.data.request.intent.name);
    log.info("app.prep - Resolving: "+required.resolve);
    return resolver.zoneWithZone(req,required.resolve)
    .then(resolver.zoneWithService.bind(null,req,required.resolve))
    .then(resolver.serviceWithService.bind(null,req,required.resolve))
    .then(resolver.commandWithCommand.bind(null,req,required.resolve))
    .then(resolver.rangeWithRange.bind(null,req,required.resolve))
    .then(resolver.channelWithName.bind(null,req,required.resolve))
    .then(verifyInfo.bind(null,req,res))
    .then(function(req){
      req.sessionAttributes.aPrep.sendTime('prep');
      return req
    })
    .fail(function (err) {
      //app.intentErr(req,res,err);
      throw err;
    });

  };

  app.intentErr = function(req,res,err){
    log.debug ("app.intentErr - "+JSON.stringify(err))
    if (_.has(err,"type")){
      if (!_.has(err,"voiceMessage")){err.voiceMessage = voiceMessages["error"][err.exception]}
      log.error ('app.intentErr - '+req.data.request.intent.name+' Intent: '+err.voiceMessage);
      switch (err.type){
        case "reprompt":
          app.doReprompt(err.voiceMessage, req, res);
          break;
        case "endSession":
          res.say(err.voiceMessage);
          res.shouldEndSession(true).send();
          break;
      }
    }else{//no error type, unhandled exception
      log.error("app.intentErr - error: "+err)
      res.say(voiceMessages.error.unknown);
      res.shouldEndSession(true).send();
    }
  };

  app.intentSuccess = function(req,res,success){
    if (_.get(req.sessionAttributes,'error',{}) === 0){
      log.debug("app.intentSuccess - "+JSON.stringify(success))
      if (_.has(success,"type")){
        if (!_.has(success,"voiceMessage")){success.voiceMessage = voiceMessages["success"]["generic"]}
        log.error ("app.intentSuccess - "+success.intent+' Intent: '+success.voiceMessage+" Note: ()");
        switch (success.type){
          case "reprompt":
            app.doReprompt(success.voiceMessage, req, res);
            break;
          case "endSession":
          default:
            res.say(success.voiceMessage);
            res.shouldEndSession(true).send();
            break;
        }
      }else{//no error type, unhandled exception
        res.say(voiceMessages.success.generic);
        res.shouldEndSession(true).send();
      }
    }else{
      log.debug('app.intentSuccess - rejecting success')
    }
  };

  app.builderErr = function(intent,type,voiceMessage,exception){
    var object = {};
    object = builder(object,"intent",intent)
    object = builder(object,"type",type)
    object = builder(object,"voiceMessage",voiceMessage)
    object = builder(object,"exception",exception)
    return object
  }
  app.builderSuccess = function(intent,type,voiceMessage,note){
    var object = {};
    object = builder(object,"intent",intent)
    object = builder(object,"type",type)
    object = builder(object,"voiceMessage",voiceMessage)
    object = builder(object,"note",note)
    return object
  }

  app.doReprompt = function(voiceMessage, req, res) {
    let reprompt = prepareReprompt(req);
    let session = req.getSession();
    session.set('reprompt', reprompt);
    log.error('prompting for '+voiceMessage);
    log.debug(JSON.stringify(res));
    app.sayReprompt(res, voiceMessage);
  }

  app.sayReprompt = function(res, voiceMessage) {
    res.say(voiceMessage);
    res.shouldEndSession(false, "").send();
  }

  app.isReprompt = function(req, name, slots) {
    let session = req.getSession();
    let reprompt = session.get('reprompt');
    if (_.isNil(reprompt)) {
      return false;
    }
    return reprompt;
  }
}

function verifyInfo(req, res) {
  var defer = q.defer();
  req.getSession().set("error", 0);
  var required = intentRequired.get(req.data.request.intent.name);
  log.info("alexaSessionLib.verifyInfo - Checking that we have all required info, intentTests: "+JSON.stringify(required.test));
  if (_.has(req,"sessionAttributes")){
    var session = req.sessionAttributes;
    log.info("alexaSessionLib.verifyInfo - session: "+JSON.stringify(session))
    for (var key in required.test){
      var scope = required.test[key]["scope"]
      var attribute = required.test[key]["attribute"]
      log.debug("alexaSessionLib.verifyInfo - scope: "+scope)
      log.debug("alexaSessionLib.verifyInfo - attribute: "+attribute)

      if (_.has(session, [scope,attribute])){
        log.info("alexaSessionLib.verifyInfo - found "+attribute)
      }else{
        log.error("alexaSessionLib.verifyInfo - did not find "+attribute)
        if (_.includes(required.failMessage,"zoneService")){
          var err = {type:"reprompt",voiceMessage:voiceMessages.reprompt["zoneService"],exception: "Missing "+attribute}
        }else{
          var err = {type:"reprompt",voiceMessage:voiceMessages.reprompt[attribute],exception: "Missing "+attribute}
        }
        req.getSession().set("error", 1);
        defer.reject(err);
        return defer.promise
      }
    }
  }
  defer.resolve(req);
  return defer.promise
}

function prepareReprompt(req) {
  let session = req.getSession();
  let reprompt = session.get('reprompt') || {};

  reprompt.intent = req.data.request.intent.name;
  reprompt.slots = req.data.request.intent.slots
  if (!reprompt.count){reprompt.count = 1}else{reprompt.count = reprompt.count+1};

  if (_.isNil(reprompt.initial)) {
    reprompt.initial = {
      intent: req.data.request.intent.name,
      slots: req.data.request.intent.slots
    };
  }
  session.set('reprompt', reprompt);
  return reprompt;
}

function mergeSlots (objValue, srcValue) {
  if (_.has(objValue,"value")){
    return objValue
  }else {
    return srcValue
  }
}

function builder(object,key,value){
  if (value){
    _.set(object, key, value);
    return object
  }else{
    return object
  }
}
