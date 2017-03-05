const
  _ = require('lodash'),
  savantLib = require('./savantLib');

log.error("currentZoneLib - Restoring currentZone Savant...")
//recall currentZone
log.error('currentZoneLib - currentzone.actionable:'+ currentZone.actionable)

if (currentZone.actionable[0] === false){
  currentZone = {};
  log.error("currentZoneLib - Using currentZone from savant...")
  savantLib.readState("userDefined.currentZone.speakable",function(stateValue) {
		set(stateValue,"speakable");
	});
  savantLib.readState("userDefined.currentZone.actionable",function(stateValue) {
		set(stateValue,"actionable");
	});
}else{
  log.error("currentZoneLib - Using currentZone from config.")
}

function set(stateValue,scope){
  if (stateValue === "" ||stateValue === "false" || stateValue === false){
    _.set(currentZone,scope,[false]);
    savantLib.writeState("userDefined.currentZone."+scope,stateValue);
    log.error('currentZoneLib - Setting currentZone.'+scope+': '+currentZone[scope]);
    return
	}
  log.error("currentZoneLib - Setting "+stateValue)
  if (stateValue.constructor != Array){
    var stateValue = stateValue.split(",");
  }else{
    var stateValue = [stateValue];
  }
  _.set(currentZone,scope,stateValue)
  savantLib.writeState("userDefined.currentZone."+scope,stateValue);

  log.error('currentZoneLib - Setting currentZone.'+scope+': '+currentZone[scope]);
};


module.exports = {
  set:set
}
