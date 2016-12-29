var fs = require('fs');
var logger = fs.createWriteStream(appLocation+'/customSlotTypes.txt', {
  //flags: 'a'
});

module.exports = function(app){
  logger.write('Custom Slot Type: ZONE \r');
  logger.write('Custom Slot Values: \r');
  for (var key in app.dictionary.systemZones){
    logger.write(app.dictionary.systemZones[key]+'\r');
  };
  logger.write('\r');
  logger.write('Custom Slot Type: ZONE_TWO \r');
  logger.write('Custom Slot Values: \r');
  for (var key in app.dictionary.systemZones){
    logger.write(app.dictionary.systemZones[key]+'\r');
  };
  logger.write('\r');
  logger.write('Custom Slot Type: SERVICE\r');
  logger.write('Custom Slot Values:\r');
  for (var key in app.dictionary.services){
    logger.write(app.dictionary.services[key]+'\r');
  };
  logger.write('\r');
  logger.write('Custom Slot Type: RANGE\r');
  logger.write('Custom Slot Values:\r');
  for (var key in app.dictionary.rangePrompt){
    logger.write(app.dictionary.rangePrompt[key]+'\r');
  };
  logger.write('\r');
  logger.write('Custom Slot Type: PERCENTAGE\r');
  logger.write('Custom Slot Values:\r');
  for (var i = 1; i < 101; i++) {
    logger.write(i.toString()+'\r');
  };
  logger.write('\r');
  logger.write('Custom Slot Type: LIGHTING\r');
  logger.write('Custom Slot Values:\r');
  for (var key in app.dictionary.lightingPrompt){
    logger.write(app.dictionary.lightingPrompt[key]+'\r');
  };
};
