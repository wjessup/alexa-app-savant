const fs = require('fs');
const path = require("path");

const filePath = path.join(__dirname, '..', '..', '..', 'public_html', 'customSlotTypes.html');
const logger = fs.createWriteStream(filePath);

function writeCustomSlot(logger, title, values) {
  logger.write(`<b>Custom Slot Type:</b> ${title}<br>`);
  logger.write('<b>Custom Slot Values:</b><br>');
  
  for (let value of values) {
    logger.write(`${value}<br>`);
  }
  
  logger.write('<BR>');
}

module.exports = function(app) {
  logger.write('<h2>Temporary Intents and Utterances:</h2>');
  logger.write('<b>Initial Intent Schema:</b> <BR>');
  logger.write('{ <br>  "intents": [ <br>{ <br>  "intent": "TEMP", <br>  "slots": [] <br>} <br>] <br>} <br>');

  logger.write('<BR>');
  logger.write('<b>Initial Sample Utterances:</b> <BR>');
  logger.write('TEMP\tTEMP<br>');

  logger.write('<h2>Custom Slots:</h2>');
  logger.write('<BR>');
  
  const { systemZones, systemGroupNames, services, serviceCommands, rangePrompt, lightingPrompt } = app.dictionary;

  writeCustomSlot(logger, 'ZONE', [...Object.values(systemZones), ...Object.values(systemGroupNames)]);
  writeCustomSlot(logger, 'ZONE_TWO', [...Object.values(systemZones), ...Object.values(systemGroupNames)]);
  writeCustomSlot(logger, 'SERVICE', Object.values(services));
  writeCustomSlot(logger, 'COMMANDREQ', Object.values(serviceCommands.transport));
  writeCustomSlot(logger, 'RANGE', Object.values(rangePrompt));
  
  const percentages = Array.from({length: 100}, (_, i) => (i + 1).toString());
  writeCustomSlot(logger, 'PERCENTAGE', percentages);

  writeCustomSlot(logger, 'LIGHTING', Object.values(lightingPrompt));
  writeCustomSlot(logger, 'CHANNEL', appDictionaryChannelsArray);

  console.error("Finished Writing customSlotTypes.");
};