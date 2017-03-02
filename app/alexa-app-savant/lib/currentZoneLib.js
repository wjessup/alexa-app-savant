const
  _ = require('lodash'),
  savantLib = require('./savantLib');


//recall currentZone
if (currentZone.actionable === false){
  currentZone = {};
  savantLib.readState("userDefined.currentZone.speakable",function(currentZone) {
		setcurrentZone(currentZone,"speakable");
	});
  savantLib.readState("userDefined.currentZone.actionable",function(currentZone) {
		setcurrentZone(currentZone,"actionable");
	});
}

function setcurrentZone(zoneIn,scope){
	if (zoneIn === "" ||zoneIn === "false"){
		zoneIn = false;
	}
  if (zoneIn.constructor === Array){
    var zoneIn = zoneIn.split(",");
  }else{
    var zoneIn = [zoneIn];
  }
  _.set(currentZone,scope,zoneIn)
	log.error('Recalling currentZone.'+scope+' from Savant: '+currentZone[scope]);
};
