const fs = require('fs');
const path = require("path");

const logger = fs.createWriteStream(path.join(__dirname, '..', '..', '..','public_html','customSlotTypes.html'), {});

function writeCustomSlotValues(slotValues) {
  for (const key in slotValues) {
    logger.write(`${slotValues[key]}<br>`);
  }
}

function writeCustomSlotType(slotType, slotValues) {
  logger.write(`<b>Custom Slot Type:</b> ${slotType}<br>`);
  logger.write('<b>Custom Slot Values:</b><br>');
  writeCustomSlotValues(slotValues);
  logger.write('<BR>');
}

module.exports = function(app) {
  const { dictionary, appDictionaryChannelsArray } = app;

  logger.write(`<h2>Temporary Intents and Utterances:</h2>
<b>Initial Intent Schema:</b> <BR>
{ <br>
  "intents": [ <br>
{ <br>
  "intent": "TEMP", <br>
  "slots": [] <br>
} <br>
] <br>
} <br>
<BR>
<b>Initial Sample Utterances:</b> <BR>
TEMP	TEMP<br>
<h2>Custom Slots:</h2>
<BR>`);

  writeCustomSlotType('ZONE', {...dictionary.systemZones, ...dictionary.systemGroupNames});
  writeCustomSlotType('ZONE_TWO', {...dictionary.systemZones, ...dictionary.systemGroupNames});
  writeCustomSlotType('SERVICE', dictionary.services);
  writeCustomSlotType('COMMANDREQ', dictionary.serviceCommands.transport);
  writeCustomSlotType('RANGE', dictionary.rangePrompt);
  writeCustomSlotType('PERCENTAGE', Array.from({length: 100}, (_, i) => i + 1));
  writeCustomSlotType('LIGHTING', dictionary.lightingPrompt);
  writeCustomSlotType('CHANNEL', appDictionaryChannelsArray);

  // log.error("Finished Writing customSlotTypes.");
};