"use strict";

const
  plist = require('simple-plist'),
  fs = require('fs'),
  _ = require('lodash'),
  q = require('q');

module.exports = function(app){

  app.getSavantVersion = function (){
    return q.nfcall(plist.readFile, documentInfo)
    .then(function(obj) {
      var ret = {}
      ret.version = obj.RPMAppDocumentBlueprintVersionKey
      if (app.compareVersion(ret.version,'8.3')< 0){//less than 0 means system version is older then 8.3
        ret.sceneSupport = false
      }else(
        ret.sceneSupport = true
      )
      log.debug("environmentLib - "+JSON.stringify(ret))
      return ret
    })
  }

  app.compareVersion = function (a, b) {
    var i, cmp, len, re = /(\.0)+[^\.]*$/;
    a = (a + '').replace(re, '').split('.');
    b = (b + '').replace(re, '').split('.');
    len = Math.min(a.length, b.length);
    for( i = 0; i < len; i++ ) {
        cmp = parseInt(a[i], 10) - parseInt(b[i], 10);
        if( cmp !== 0 ) {
            return cmp;
        }
    }
    return a.length - b.length;
	}

};
