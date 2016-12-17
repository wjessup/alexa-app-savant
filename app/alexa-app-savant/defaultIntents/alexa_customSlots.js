//Intent includes


//Intent exports
module.change_code = 1;
module.exports = function(app,callback){

//Intent meta information
  var intentDictionary = {
    'intentName' : 'customSlots',
    'intentVersion' : '1.0',
    'intentDescription' : 'print slot information for creating interaction model',
    'intentEnabled' : 1
  };

//Intent Enable/Disable
  if (intentDictionary.intentEnabled === 1){

//Intent
    app.intent('customSlots', {
    		"slots":{}
    		,"utterances":["print slots"]
    	},function(req,res) {
        console.log('Slot Type: ZONE');
        console.log('');
        console.log('Slot Value:');
        console.log('');
        for (key in app.dictionary.systemZones){
    			console.log(app.dictionary.systemZones[key]);
    		};

        console.log('');
        console.log('');

        console.log('Slot Type: SERVICE');
        console.log('');
        console.log('Slot Value:');
        console.log('');
        for (key in app.dictionary.services){
          console.log(app.dictionary.services[key]);
        };
    	}
    );
  }
//Return intent meta info to index
  callback(intentDictionary);
};
