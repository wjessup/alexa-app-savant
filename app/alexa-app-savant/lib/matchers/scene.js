const
  savantLib = require('../savantLib'),
  fuzzy = require('./fuzzy'),
  _ = require('lodash'),
  similarity = require("similarity"),
  q = require('q');

function getScene(scene){
  var a = new eventAnalytics.event();
  var defer = q.defer();
  if (!scene){var scene = ''}
  log.error('matcher.getScene - looking for: "'+scene+'"')
  savantLib.getSceneNames()
    .then(function (systemScenes){
      var matchedScene = fuzzy.findBest(scene,_.keys(systemScenes))
      var matchedSceneObj = (systemScenes[matchedScene.name])
      defer.resolve(matchedSceneObj);
  });
  a.sendTime("Matching","scene.getScene");
  return defer.promise
}

module.exports = {
  getScene:getScene
}
