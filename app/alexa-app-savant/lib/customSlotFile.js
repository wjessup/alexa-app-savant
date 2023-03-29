//Refactored code

const fs = require('fs');
const path = require("path");

const logger = fs.createWriteStream(path.join(__dirname, '..', '..', '..','public_html','customSlotTypes.html'));

module.exports = function(app){
    //Temporary Intents and Utterances
    logger.write('<h2>Temporary Intents and Utterances:</h2>');
    logger.write('<b>Initial Intent Schema:</b> <BR>');
    logger.write('{ <br> "intents": [ <br> { <br> "intent": "TEMP", <br> "slots": [] <br> } <br> ] <br> } <br>');

    logger.write('<BR>');
    logger.write('<b>Initial Sample Utterances:</b> <BR>');
    logger.write('TEMP	TEMP<br>');

    //Custom Slots
    logger.write('<h2>Custom Slots:</h2>');
    logger.write('<BR>');
    
    //ZONE
    logger.write('<b>Custom Slot Type:</b> ZONE <br>');
    logger.write('<b>Custom Slot Values:</b> <br>');
    for (const key in app.dictionary.systemZones){
        logger.write(app.dictionary.systemZones[key]+'<br>');
    };
    for (const key in app.dictionary.systemGroupNames){
        logger.write(app.dictionary.systemGroupNames[key]+'<br>');
    };
    
    //ZONE_TWO
    logger.write('<BR>');
    logger.write('<b>Custom Slot Type:</b> ZONE_TWO <BR>');
    logger.write('<b>Custom Slot Values:</b> <br>');
    for (const key in app.dictionary.systemZones){
        logger.write(app.dictionary.systemZones[key]+'<br>');
    };
    for (const key in app.dictionary.systemGroupNames){
        logger.write(app.dictionary.systemGroupNames[key]+'<br>');
    };

    //SERVICE
    logger.write('<BR>');
    logger.write('<b>Custom Slot Type:</b> SERVICE<br>');
    logger.write('<b>Custom Slot Values:</b><br>');
    for (const key in app.dictionary.services){
        logger.write(app.dictionary.services[key]+'<br>');
    };

    //COMMANDREQ
    logger.write('<BR>');
    logger.write('<b>Custom Slot Type:</b> COMMANDREQ<br>');
    logger.write('<b>Custom Slot Values:</b><br>');
    for (const key in app.dictionary.serviceCommands.transport){
        logger.write(app.dictionary.serviceCommands.transport[key]+'<br>');
    };
  
    //RANGE
    logger.write('<BR>');
    logger.write('<b>Custom Slot Type:</b> RANGE<br>');
    logger.write('<b>Custom Slot Values:</b><br>');
    for (const key in app.dictionary.rangePrompt){
        logger.write(app.dictionary.rangePrompt[key]+'<br>');
    };
  
    //PERCENTAGE
    logger.write('<BR>');
    logger.write('<b>Custom Slot Type:</b> PERCENTAGE<br>');
    logger.write('<b>Custom Slot Values:</b><br>');
    for (let i = 1; i < 101; i++) {
        logger.write(i.toString()+'<br>');
    };
  
    //LIGHTING
    logger.write('<BR>');
    logger.write('<b>Custom Slot Type:</b> LIGHTING<br>');
    logger.write('<b>Custom Slot Values:</b><br>');
    for (const key in app.dictionary.lightingPrompt){
        logger.write(app.dictionary.lightingPrompt[key]+'<br>');
    };
  
    //CHANNEL
    logger.write('<BR>');
    logger.write('<b>Custom Slot Type:</b> CHANNEL<br>');
    logger.write('<b>Custom Slot Values:</b><br>');
    for (const key in app.dictionary.channelsArray){
        logger.write(app.dictionary.channelsArray[key]+'<br>');
    };
  
    console.error("Finished Writing customSlotTypes.");
};