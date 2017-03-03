const
  _ = require('lodash'),
  similarity = require("similarity");

function findBest(request,library) {
  var best = { score: 0, name:''};
  _.forEach(library,function(entry){
    //log.debug('request: '+request)
    //log.debug('library: '+library)
    var distance = similarity(request, entry)
    log.debug(entry+' was scored: '+distance)
    if (distance > best.score){
      best.score = distance;
      best.name = entry;
      log.debug("best Match: "+best.name+" @ "+best.score)
    }
  })
  return best;
}

module.exports = {
  findBest:findBest
}
