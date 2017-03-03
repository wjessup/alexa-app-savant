"use strict";

const
  plist = require('simple-plist'),
  fs = require('fs'),
  _ = require('lodash'),
  q = require('q');

function getSavantVersion(){
  return q.nfcall(plist.readFile, documentInfo)
  .then(function(obj) {
    var ret = {}
    ret.version = Number(obj.RPMAppDocumentBlueprintVersionKey)
    if (ret.version >= 8.3){
      ret.sceneSupport = true
    }else(
      ret.sceneSupport = false
    )
    log.debug("environmentLib - "+JSON.stringify(ret))
    return ret
  })
}

  module.exports = {
  getSavantVersion: getSavantVersion
  }
