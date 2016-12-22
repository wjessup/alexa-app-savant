# alexa-app-savant

An alexa-app app to control Savant systems

## Install
Pro Host:
cd ~/Downloads && curl --remote-name http://28seven.net/alexa-app-savant/mac_setup.sh && chmod a+x mac_setup.sh && sudo ./mac_setup.sh
Smart Host:
cd /home/RPM && curl --remote-name http://28seven.net/alexa-app-savant/smart_setup.sh && chmod a+x smart_setup.sh && sudo ./smart_setup.sh


## usage
1. I want to: Make sure that alexa-skill-app is connected and running
    1. You say: alexa tell Savant
    2. alexa Responds: "Welcome to your Savant System”
    3. Expectation: none, this will only provide the acknowledgment that the systems are connected
2. I want to: Turn off all AV Zones
    1. You say: alexa ask Savant to turn off all zones
    2. alexa Responds: “Turning off all zones”
    3. Expectation: The zone will turn off , TV and sound.
3. I want to: Turn off an AV Zone
    1. You say: alexa ask Savant to turn off kitchen
    2. alexa Responds: “Turning off Kitchen”
    3. Expectation: The desired AV zone will turn off, TV and sound.
4. I want to: Turn on an AV Zone
    1. You say: alexa ask Savant to turn on Kitchen
    2. alexa Responds: "Turning on <<service name>> in Kitchen
    3. Expectation: Savant system will follow powerOn workflow for the last used service in zone
    4. Exception: If there was not a perviously used service in the zone (Kitchen.LastActiveService is empty) then it will respond: "No previous service. Please say which service to turn on"
5.  I want to: Turn on lights in an AV zone
    1. You say: “alexa ask Savant to turn on Kitchen lights
    2. alexa Responds: “Turning on Kitchen lights”
    3. Expectation: Lights which are assigned to the AV zone will turn on (100%), same as if lighting was used from savant app or voice remote
6. I want to:  Turn off lights in an AV zone
    1. You say: alexa ask Savant to turn off Kitchen Lights
    2. alexa Responds: “Turning off Kitchen Lights"
    3. Expectation: Lights which are assigned to the AV zone will turn off (0%), same as if lighting was used from savant app or voice remote
7.  I want to: send the play command to an AV zone
    1. You say: alexa ask Savant to send play command in Kitchen
    2. alexa Responds: “Play"
    3. Expectation: what ever service is active in requested zone will Play
8.  I want to: send the pause command to an AV zone
    1. You say: alexa ask Savant to pause  Kitchen
    2. alexa Responds: “Pause"
    3. Expectation: What ever service is active in requested zone will Pause
9. I want to: Set the volume of an AV zone by percentage
    1. You say: alexa ask Savant to set volume in Kitchen to 50%
    2. alexa Responds: “Setting volume to 50 percent"
    3. Expectation: AV zone volume will adjust to requested percentage.
    4. Note:There is no intelligence in this action, if the user is in a zone with high gain and 50% is too loud, the user is going to get something that is too loud.  It is to be expected that the user would need to know comfortable percentages based on that zone
10.  I want to: Set Volume of an av zone high, medium, low
    1. You say: alexa ask Savant to set kitchen volume to medium
    2. alexa Responds: “Setting Volume to medium"
    3. Expectation: AV zone volume will adjust to a preset level, by default medium is 50%
    4. Note:There is no intelligence in this action, if the user is in a zone with high gain and medium is too loud, the user is going to get something that is too loud.  It is to be expected that the user would need to know comfortable presets based on that zone.
11.  I want to: Lower volume of an AV zone
    1. You say: alexa ask Savant to make Kitchen Lower
    2. alexa Responds: "Lowering volume in Kitchen"
    3. Expectation: AV zone volume will be reduced 12%
12.  I want to: Lower volume in an AV zone by a larger percentage
    1. You say: alexa ask Savant to make Kitchen much lower
    2. alexa Responds: "Lowering volume a lot in Kitchen”
    3. Expectation: AV zone volume will be reduced 40%
13.  I want to: Raise volume of an AV zone
    1. You say: alexa ask Savant to make Kitchen louder
    2. alexa Responds: “Increasing volume in Kitchen"
    3. Expectation: AV zone volume will be increased 12%
14.  I want to: Raise volume in an AV zone by a larger percentage
    1. You say: alexa ask Savant to make Kitchen much louder
    2. alexa Responds: “Increasing volume a lot in Kitchen”
    3. Expectation: AV zone volume will be increased 40%
    4. Note:There is no intelligence in this action, if the user is in a zone is already at 60% this action will bring it to 100%
15.  I want to: Turn on a service in an AV zone (audio or video)
    1. You say: alexa ask Savant to Turn on Sonos in Kitchen
    2. alexa Responds: “Turning on Sonos in Kitchen
    3. Expectation: powerOn workflow will be run for service matching request
    4. Note:  
16.  I want to: Turn sleep timer on in a zone
    1. You say: alexa ask Savant to set sleep timer for 15 minute in Kitchen
    2. alexa Responds: “Sleep timer set for 15 minutes"
    3. Expectation: Savant’s zone sleep timer will turn on for requested amount of time
17.  I want to: Extend sleep timer
    1. You say: alexa ask Savant to add 10 minutes to timer in Kitchen
    2. alexa Responds: “Adding 10 more minutes in Kitchen"
    3. Expectation: Sleep timer will increment by requested amount
18.  I want to: Turn off sleep timer
    1. You say: alexa ask Savant toStop sleep timer in Kitchen
    2. alexa Responds: “Sleep timer disabled in Kitchen
    3. Expectation: Sleep timer stops in desired zone
19.  I want to: Know the current temperature in the home
    1. You say: alexa ask Savant What is the current temperature
    2. alexa Responds: “it is currently 70 degrees inside"
    3. Expectation: get the current zone temperature
20.  I want to: Know what mode the thermostat is in
    1. You say: alexa ask Savant if the heat is on?
    2. alexa Responds: “The system is currently set to heat"
    3. Expectation: thermostat will respond with current mode, cool, heat, auto, off
21.  I want to: know the current heat point
    1. You say: alexa ask Savant what the heat is set to
    2. alexa Responds: “The heat is currently set to 70 degrees"
    3. Expectation: Thermostat responds with current heat point
22.  I want to: Know the current cool point
    1. You say: alexa ask Savant what the AC is set to
    2. alexa Responds: “The AC is currently set to 68 degrees"
    3. Expectation: Thermostat will second with current cool point
23.  I want to: Set HVAC mode
    1. You say: alexa ask Savant to set system to heat
    2. alexa Responds: “Setting system mode to heat"
    3. Expectation: Set thermostat mode, Cool, heat, auto, off, on
24.  I want to: set heat point
    1. You say: alexa ask Savant set heat to 70 degrees
    2. alexa Responds: “Setting heat to 70 degrees"
    3. Expectation: thermostat heat set point will change to requested value
25.  I want to: set cool point
    1. You say: alexa ask Savant set heat to 75 degrees
    2. alexa Responds: “Setting AC to 75 degrees"
    3. Expectation:  thermostat cool set point will change to requested value
26.  I want to: reboot alexa-app-savant skill
    1. You say: alexa tell Savant to reboot
    2. alexa Responds: I’ll be back"
    3. Expectation:  skill will reboot, very helpful during testing and programming to load
