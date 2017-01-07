
function addAnd(cleanZones){
  console.log("im here");
  if (cleanZones.length>1){//add "and" if more then one zone was requested
    var pos = (cleanZones.length)-1;
    cleanZones.splice(pos,0,"and");
  }
  console.log("still here");
  return cleanZones;
}

module.exports = {
  addAnd: addAnd
}
