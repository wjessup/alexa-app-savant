var plist = require('bplist-parser');
var fs = require('fs');

function getZones(plistFile, callback)
{
    plist.parseFile(plistFile, function (err, obj) {
        if (err) {
            callback(err, undefined);
        }
        else {
            obj = obj[0]
            var ret = []
            for (var key in obj){
                if (obj[key].RPMZoneItemClass === 'RPMZoneItem'){
                    ret.push(key);
                }
            }
            callback(err, ret);
        }
    });
}


function getZoneServices(plistFile, callback)
{
    plist.parseFile(plistFile, function (err, obj) {
        if (err) {
            callback(err, undefined );
        }
        else {
            obj = obj[0].ServiceOrderPerZone;
            var ret = []

            for (var key in obj){
              var dic = []
                for (var key2 in obj[key]){
                    if (obj[key][key2]["Enabled"]==1){
                    dic.push([key,obj[key][key2]["Source Component"],obj[key][key2]["Source Logical Component"],obj[key][key2]["Service Variant ID"],obj[key][key2]["Service Type"],obj[key][key2]["Service Type"],obj[key][key2]["Alias"]]);
                    }
                  }
                  ret[key] = dic;
            }
            callback(err, ret);
        }
    });
}

//example:
//getPlistKeys(zoneInfo, function (err, keys) { console.log(keys); });


module.exports = {
getZones: getZones,
getZoneServices: getZoneServices
}
