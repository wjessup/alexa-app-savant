const savantLib = require('../savantLib');
const fuzzy = require('./fuzzy');
const similarity = require('similarity');
const _ = require('lodash');
const q = require('q');

function getScene(scene = '') {
  let defer = q.defer();
  let a = new eventAnalytics.event();
  const systemScenes = savantLib.getSceneNames();
  systemScenes.then((scenes) => {
    const matchedScene = fuzzy.findBest(scene, _.keys(scenes));
    const matchedSceneObj = scenes[matchedScene.name];
    defer.resolve(matchedSceneObj);
  });
  a.sendTime('Matching', 'scene.getScene');
  return defer.promise;
}

module.exports = {
  getScene,
};