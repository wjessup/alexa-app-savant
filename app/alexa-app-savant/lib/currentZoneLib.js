"use strict";

const plist = require("simple-plist");
const q = require("q");

module.exports = function (app) {
  const documentInfo = ""; // add the appropriate path to documentInfo

  app.getSavantVersion = function () {
    return q.nfcall(plist.readFile, documentInfo).then(function(obj) {
      const ret = {
        version: obj.RPMAppDocumentBlueprintVersionKey,
        sceneSupport: app.compareVersion(obj.RPMAppDocumentBlueprintVersionKey, "8.3") > -1,
      };
      console.log("environmentLib - " + JSON.stringify(ret));
      return ret;
    });
  };

  app.compareVersion = function (a, b) {
    const re = /(\.0)+[^\.]*$/;
    a = String(a).replace(re, "").split(".");
    b = String(b).replace(re, "").split(".");

    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const cmp = parseInt(a[i], 10) - parseInt(b[i], 10);
      if (cmp !== 0) return cmp;
    }

    return a.length - b.length;
  };
};