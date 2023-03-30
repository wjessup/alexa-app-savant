const fs = require('fs');
const path = require("path");
const logger = fs.createWriteStream(path.join(__dirname, '..', '..', '..', 'public_html', 'customSlotTypes.html'));

module.exports = function (app) {
  const { systemZones, systemGroupNames, services, serviceCommands, rangePrompt, lightingPrompt } = app.dictionary;

  logger.write('<h2>Temporary Intents and Utterances:</h2>');
  logger.write('<b>Initial Intent Schema:</b><br>');
  logger.write('{<br>');
  logger.write('  "intents": [<br>');
  logger.write('{<br>');
  logger.write('  "intent": "TEMP",<br>');
  logger.write('  "slots": []<br>');
  logger.write('}<br>');
  logger.write(']<br>');
  logger.write('}<br>');

  logger.write('<br>');
  logger.write('<b>Initial Sample Utterances:</b><br>');
  logger.write('TEMP    TEMP<br>');

  logger.write('<h2>Custom Slots:</h2><br>');

  logger.write('<b>Custom Slot Type:</b> ZONE<br>');
  logger.write('<b>Custom Slot Values:</b><br>');
  (systemZones.concat(systemGroupNames)).forEach((zone) => {
    logger.write(zone + '<br>');
  });

  logger.write('<br>');
  logger.write('<b>Custom Slot Type:</b> ZONE_TWO<br>');
  logger.write('<b>Custom Slot Values:</b><br>');
  (systemZones.concat(systemGroupNames)).forEach((zoneTwo) => {
    logger.write(zoneTwo + '<br>');
  });

  logger.write('<br>');
  logger.write('<b>Custom Slot Type:</b> SERVICE<br>');
  logger.write('<b>Custom Slot Values:</b><br>');
  services.forEach((service) => {
    logger.write(service + '<br>');
  });

  logger.write('<br>');
  logger.write('<b>Custom Slot Type:</b> COMMANDREQ<br>');
  logger.write('<b>Custom Slot Values:</b><br>');
  serviceCommands.transport.forEach((command) => {
    logger.write(command + '<br>');
  });

  logger.write('<br>');
  logger.write('<b>Custom Slot Type:</b> RANGE<br>');
  logger.write('<b>Custom Slot Values:</b><br>');
  rangePrompt.forEach((range) => {
    logger.write(range + '<br>');
  });

  logger.write('<br>');
  logger.write('<b>Custom Slot Type:</b> PERCENTAGE<br>');
  logger.write('<b>Custom Slot Values:</b><br>');
  for (let i = 1; i <= 100; i++) {
    logger.write(i.toString() + '<br>');
  }

  logger.write('<br>');
  logger.write('<b>Custom Slot Type:</b> LIGHTING<br>');
  logger.write('<b>Custom Slot Values:</b><br>');
  lightingPrompt.forEach((lighting) => {
    logger.write(lighting + '<br>');
  });

  logger.write('<br>');
  logger.write('<b>Custom Slot Type:</b> CHANNEL<br>');
  logger.write('<b>Custom Slot Values:</b><br>');
  app.dictionary.appChannelsArray.forEach((appChannel) => {
    logger.write(appChannel + '<br>');
  });

  log.debug("Finished Writing customSlotTypes.");
};