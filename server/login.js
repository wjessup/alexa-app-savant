const fs = require('fs');
const path = require("path");
const logger = fs.createWriteStream(path.join(__dirname, '..', '..', '..','public_html','customSlotTypes.html'));

function writeCustomSlot(logger, typeName, values) {
  logger.write(`<b>Custom Slot Type:</b> ${typeName}<br>`);
  logger.write('<b>Custom Slot Values:</b><br>');
  
  for (const key in values) {
    logger.write(`${values[key]}<br>`);
  }
  logger.write('<BR>');
}

module.exports = function(app){
  logger.write('<h2>Temporary Intents and Utterances:</h2>');
  logger.write('<b>Initial Intent Schema:</b> <BR>');
  logger.write(`{
  "intents": [
    {
      "intent": "TEMP",
      "slots": []
    }
  ]
}<br>`);

  logger.write('<BR>');
  logger.write('<b>Initial Sample Utterances:</b> <BR>');
  logger.write('TEMP	TEMP<br>');

  logger.write('<h2>Custom Slots:</h2>');
  logger.write('<BR>');
  
  writeCustomSlot(logger, 'ZONE', app.dictionary.systemZones);
  writeCustomSlot(logger, 'ZONE_TWO', app.dictionary.systemGroupNames);
  writeCustomSlot(logger, 'SERVICE', app.dictionary.services);
  writeCustomSlot(logger, 'COMMANDREQ', app.dictionary.serviceCommands.transport);
  writeCustomSlot(logger, 'RANGE', app.dictionary.rangePrompt);
  
  logger.write('<b>Custom Slot Type:</b> PERCENTAGE<br>');
  logger.write('<b>Custom Slot Values:</b><br>');
  for (let i = 1; i < 101; i++) {
    logger.write(`${i}<br>`);
  }
  logger.write('<BR>');
  
  writeCustomSlot(logger, 'LIGHTING', app.dictionary.lightingPrompt);
  writeCustomSlot(logger, 'CHANNEL', app.get('dictionary_channels_array'));

  console.error("Finished Writing customSlotTypes.");
};