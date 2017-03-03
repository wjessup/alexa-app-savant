'use strict';

const
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash');

var requiredDic = {};

function set(intentDictionary){
  if (_.has(intentDictionary,"required")){
    _.set(requiredDic,intentDictionary.name,intentDictionary.required)
    log.debug("  "+JSON.stringify(requiredDic[intentDictionary.name]));
  }else{
    _.set(requiredDic,intentDictionary.name,"")
    log.debug("  no required set")
  }
}

function get(intent){
  return requiredDic[intent]
}

  module.exports = {
    set:set,
    get:get
  }
