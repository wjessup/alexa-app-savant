'use strict';

const
  matcherService  = require('./matchers/service'),
  matcherZone  = require('./matchers/zone'),
  matcherCommand = require('./matchers/command'),
  matcherWord  = require('./matchers/word'),
  matcherChannel  = require('./matchers/channel'),
  matchersScene  = require('./matchers/scene'),
  voiceMessages = require('./voiceMessages.json'),
  _ = require('lodash'),
  q = require('q');

function zoneWithZone (req, intentResolves){
  log.debug('resovler.ZoneWithZone - start')
  if (_.includes(intentResolves,"zoneWithZone")){
    if (req.slot('ZONE') || req.slot('ZONE_TWO') || currentZone.actionable != false){
      let session = req.getSession();
      if (!_.has(session, "zone")){//if we do not already have a zone
        return matcherZone.multi(req.slot('ZONE'), req.slot('ZONE_TWO'))//parse requested zone and return
          .then(function(ret) {
            log.error('resovler.zoneWithZone - found actionable zone: '+ret.actionable);
            log.error('resovler.zoneWithZone - found speakable zone: '+ret.speakable);
            req.getSession().set("zone", {"speakable":ret.speakable,"actionable":ret.actionable});
          })
          .thenResolve(req)
          .fail(function(err) {//Zone could not be found
          //  log.error('resovler.zoneWithZone - zone err: '+err)
          });
      }
    }else{
      return q(req);
    }
  } else {
    log.info('resovleZoneWithZone - did not try: '+intentResolves)
    return q(req);
  }
}

function zoneWithService (req, intentResolves){
  log.debug('resovler.zoneWithService - start')
  if (_.includes(intentResolves,"zoneWithService")){
    let session = req.getSession();
    if (!_.has(session, "zone")){//if we do not already have a zone
      return matcherService.active(req.slot('SERVICE'))//Parse requested service and return
        .then(function(ret) {
          log.error('resovler.zoneWithService - matched service: '+ret.service.name);
          log.error('resovler.zoneWithService - found actionable zone: '+ret.zone.actionable);
          log.error('resovler.zoneWithService - found speakable zone: '+ret.zone.speakable);
          req.getSession().set("zone", ret.zone);
          req.getSession().set("service", ret.service);
        })
        .thenResolve(req)
        .fail(function(err) {//Zone could not be found
          log.debug('resovler.zoneWithService - error: '+err)
          if (err.type === "endSession"){
            if (!_.has(err,"voiceMessage")){
              err.voiceMessage = req.slot('SERVICE')+voiceMessages["error"][err.exception]
            }
            throw err;
          }
        });
    }
  }else{
    log.info('resovler.zoneWithService - did not try: '+intentResolves)
    return q(req);
  }
}

function serviceWithService(req, intentResolves){
  log.debug('resovler.serviceWithService - start')
  if (_.includes(intentResolves,"serviceWithService")){
    let session = req.sessionAttributes;
    return matcherService.avaiable(session.zone.actionable,req.slot('SERVICE'))
    .then(function(ret){
      log.error('resovler.serviceWithService - matched Services: '+JSON.stringify(ret));
      req.getSession().set("service", ret);
    })
    .thenResolve(req)
    .fail( function(err){
      log.info('resovler.serviceWithService - did not find match')
      return q(req);
      //throw err;
    });
  }else{
    log.info('resovler.serviceWithService - did not try: '+intentResolves)
    return q(req);
  }
}

function commandWithCommand (req,intentResolves){
  log.debug('resovler.commandWithCommand - start')
  if (_.includes(intentResolves,"commandWithCommand")){
    return matcherCommand.commandMatcher(req.slot('COMMANDREQ'))
    .then(function(ret) {
      log.error('resovler.commandWithCommand - matched command: '+JSON.stringify(ret));
      req.getSession().set("command", ret);
    })
    .thenResolve(req)
    .fail(function(err) {//service could not be found
      log.info('resovler.commandWithCommand - err: '+JSON.stringify(err))
      if (err.type === "endSession"){
        if (!_.has(err,"voiceMessage")){
          err.voiceMessage = voiceMessages["error"][err.exception]
        }
        throw err;
      }
      //throw err;
    });
  }else{
    log.info('resovler.commandWithCommand - did not try: '+intentResolves)
    return q(req);
  }
}

function rangeWithRange(req,intentResolves){
  log.debug('resovler.rangeWithRange - start')
  if (_.includes(intentResolves,"rangeWithRange")){
    return matcherWord.range(req.slot('RANGE'))
    .then(function(ret){
      log.error('resovler.rangeWithRange - matched range: '+JSON.stringify(ret));
      req.getSession().set("prams", ret);
    })
    .thenResolve(req)
    .fail(function(err) {//range could not be matched
      log.info('resovler.rangeWithRange - err: '+JSON.stringify(err))
      //if (err.type === "endSession"){
      //  if (!_.has(err,"voiceMessage")){
      //    err.voiceMessage = voiceMessages["error"][err.exception]
      //  }
      //  throw err;
      //}
    });
  }else{
  log.info('resovler.rangeWithRange - did not try: '+intentResolves)
  return q(req);
  }
}

function channelWithName(req,intentResolves){
  log.debug('resovler.channelWithName - start')
  if (_.includes(intentResolves,"channelWithName")){
    if (!req.slot('CHANNEL')){
      return
    }
    let session = req.sessionAttributes;
    if (_.has(session, "zone")){
      log.error("session.zone.actionable: "+session.zone.actionable)
      log.error("session.zone.actionable[0]: "+session.zone.actionable[0])
      return matcherChannel.getChannel(session.zone.actionable[0],req.slot('CHANNEL'))
      .then(function (ret){
        log.error('resovler.channelWithName - matched channel: '+JSON.stringify(ret));
        req.getSession().set("channel", ret);
      })
      .thenResolve(req)
      .fail(function(err) {//range could not be matched
        log.info('resovler.channelWithName - err: '+JSON.stringify(err))
        if (err.type === "endSession"){
          if (!_.has(err,"voiceMessage")){
            err.voiceMessage = voiceMessages["error"][err.exception]+session.zone.actionable[0]
          }
          throw err;
        }
      });
    }else{
      log.error('resovler.channelWithName - request was missing zone');
    }
  }else{
  log.info('resovler.channelWithName - did not try: '+intentResolves)
  return q(req);
  }
}

function sceneWithScene(req,intentResolves){
  log.debug('resovler.sceneWithScene - start')
  if (_.includes(intentResolves,"sceneWithScene")){
    if (!req.slot('SCENE')){
      return
    }
    return matchersScene.getScene(req.slot('SCENE'))
    .then(function (ret){
      log.error('resovler.sceneWithScene - matched scene: '+JSON.stringify(ret));
      req.getSession().set("scene", ret);
    })
    .thenResolve(req)
    .fail(function(err) {//range could not be matched
      log.info('resovler.sceneWithScene - err: '+JSON.stringify(err))
      if (err.type === "endSession"){
        if (!_.has(err,"voiceMessage")){
          err.voiceMessage = "this needs something..."//voiceMessages["error"][err.exception]+session.zone.actionable[0]
        }
        throw err;
      }
    });
  }
  log.info('resovler.sceneWithScene - did not try: '+intentResolves)
  return q(req);
}



module.exports = {
  zoneWithZone:zoneWithZone,
  zoneWithService:zoneWithService,
  serviceWithService:serviceWithService,
  commandWithCommand:commandWithCommand,
  rangeWithRange:rangeWithRange,
  channelWithName:channelWithName,
  sceneWithScene:sceneWithScene
}
