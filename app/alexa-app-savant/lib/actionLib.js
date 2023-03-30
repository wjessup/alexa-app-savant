//Import required libraries
const dnode = require('dnode');
const savantLib = require('./savantLib');

//Setup any required Savant states
console.log('Setting up fletch button...');
savantLib.writeState("userDefined.fletchButton", 1);

//Start server to receive requests from lambda server
const server = dnode({
    customRequest: function (s, cb) {
		savantLib.readState("userDefined.fletchButton", function(error, fletchButton) {
			if (error) {
			    console.error(`Error while reading fletch button state: ${error}`);
			    return;
			}
			console.log(`Fletch button state: ${fletchButton}`);
			
			if (fletchButton === 1){
				savantLib.readState('Kitchen.ZoneIsActive', function(error, isActive) {
					if (error) {
					    console.error(`Error while reading Kitchen zone: ${error}`);
					    return cb();
					}
					console.log(`Kitchen zone isActive: ${isActive}`);
					
					if (isActive === 0) {
						savantLib.serviceRequest([s], "custom");
						return cb();
					} else {
						savantLib.serviceRequest(["Kitchen", "PowerOff"], "zone");
						return cb();
					}
				});
			} else {
				console.log("Fletch button is disabled, skipping request.");
				//FEEDBACK
			}			      
		});
    }
});
server.listen(5004, function(error) {
	if (error) {
	    console.error(`Error while starting dnode server: ${error}`);
	    return;
	}
	console.log(`Server is listening on port 5004`);
});

/*
Lambda function to run

exports.handler = function(event, context, callback) {
    const dnode = require('dnode');
    const d = dnode.connect('<<Savant host WAN address>>', 5004);
    d.on('remote', function (remote) {
        remote.customRequest('Lutron_KitchenAV_On', function (s) {
            console.log('Maybe i can tell Amazon IoT something here?');
            d.end();
        });
    });
};
*/