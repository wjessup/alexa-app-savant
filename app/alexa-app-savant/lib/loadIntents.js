const _ = require('lodash');
const similarity = require('similarity');

function findBest(request, library) {
  let best = { score: 0, name: '' };

  library.forEach((entry) => {
    const distance = similarity(request, entry);
    console.debug(`${entry} was scored: ${distance}`);

    if (distance > best.score) {
      best.score = distance;
      best.name = entry;
      console.debug(`best Match: ${best.name} @ ${best.score}`);
    }
  });
  
  return best;
}

module.exports = {
  findBest,
};