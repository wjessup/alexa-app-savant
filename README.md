# alexa-app-savant

An alexa-app app to control Savant systems

## Intro
Ready to get started? The alexa-app-savant app make things pretty easy but there are still quite a few steps. no one action is difficult but there is some advanced stuff going on under the hood.  Stick to the instructions and you’ll be just fine. if you get stuck shoot me an email

Note: these instructions are for Pro hosts (macs) only at this time.  This should all run fine on a smart host but it will take me a bit more time to document that install process, if you are feeling adventurous give it a shot yourself

##Get Ready
* Sign up for amazon Developer account
    * https://developer.amazon.com/
    * You will need to have a credit card attached to your amazon account.  But don’t worry, amazon does not charge for any service we will use to setup alexa.
* Download and install Node.JS on Savant Pro Host
    * https://nodejs.org/en/
        * Install 6.9.2, or whichever version is labeled “ Recommended for Most Users"
        * Installing Node on a smart host:
          * sudo apt-get update
          * sudo apt-get install curl
          * curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
          * sudo apt-get install -y nodejs
* Network setup
    * You will need to know your DNS or external ip address in the next version. take note of that now
    * Will need to forward port 443 to your host
        * use service if you can’t
            * https://localtunnel.github.io/www/

## Pro Host Install
cd ~/Downloads && curl --remote-name http://28seven.net/alexa-app-savant/mac_setup.sh && chmod a+x mac_setup.sh && sudo ./mac_setup.sh

## Smart Host Install
cd /home/RPM && curl --remote-name http://28seven.net/alexa-app-savant/smart_setup.sh && chmod a+x smart_setup.sh && sudo ./smart_setup.sh

## Install on Host
* All this gets done with a small script you run in the terminal on the host(copy/paste into terminal and push enter). Make sure you run setup script for your type of host
    * The install on the host is completely automated. A lot of stuff is about to happen. Just a quick peak behind the scenes. (you can see the script [here](https://gitlab.com/twentyeight7/alexa-app-savant/blob/master/setup/mac_setup.sh)).
        1. Make install directory ’/alexa-app-savant’
        2. Download alexa-savant and watchdog service from [npm](https://www.npmjs.com/package/alexa-app-savant)
        3. Move components around
        4. Install all the dependencies (this is built on top of [alexa-app](https://www.npmjs.com/package/alexa-app))
        5. Install a launch agent so the service will start with boot
        6. generate SSL certificates and put them in the right place. A copy is also placed on your desktop, you will need it later.
        7. Start the watchdog service
        8. setup the IP routing (port 1414 => 443)
* during the install you will be prompted for information to setup the ssl certs, you can skip the entry (just push enter) of everything except for the prompt about your "fully qualified domain name (FQDN), “at that point you will need to put in your DNS or WAN IP address.
* Verify
    * When the script is complete you will want to check two things
        * there are 3 new files on your desktop
            * private-key.pem
            * cert.cer
            * alexaLog-0.log
        * there is now a webpage served at http://localhost:4141/alexa/savant (look at this on the host, otherwise do: http://<<Host IP>>:4141/alexa/savant)

## usage
See all these in action [here](http://www.28seven.net/christopherclark/2016/12/20/alexa-app-savant-feature-set/)

### Getting Started:
  1. I want to: Make sure that alexa-skill-app is connected and running
      1. You say: alexa tell Savant
      2. alexa Responds: "Welcome to your Savant System”
      3. Expectation: none, this will only provide the acknowledgment that the systems are connected
  2.  I want to: reboot alexa-app-savant skill
      1. You say: alexa tell Savant to reboot
      2. alexa Responds: I’ll be back"
      3. Expectation:  skill will reboot, very helpful during testing and programming to load

### Controlling AV:
  1. I want to: Turn off all AV Zones
      * You say: alexa ask Savant to turn off all zones
      * alexa Responds: “Turning off all zones”
      * Expectation: The zone will turn off , TV and sound.
  2. I want to: Turn off an AV Zone
      * You say: alexa ask Savant to turn off kitchen
      * alexa Responds: “Turning off Kitchen”
      * Expectation: The desired AV zone will turn off, TV and sound.
  3. I want to: Turn on an AV Zone
      * You say: alexa ask Savant to turn on Kitchen
      * alexa Responds: "Turning on <<service name>> in Kitchen
      * Expectation: Savant system will follow powerOn workflow for the last used service in zone
      * Exception: If there was not a perviously used service in the zone (Kitchen.LastActiveService is empty) then it will respond: "No previous service. Please say which service to turn on"
  4.  I want to: send the play command to an AV zone
      * You say: alexa ask Savant to send play command in Kitchen
      * alexa Responds: “Play"
      * Expectation: what ever service is active in requested zone will Play
  5.  I want to: send the pause command to an AV zone
      * You say: alexa ask Savant to pause  Kitchen
      * alexa Responds: “Pause"
      * Expectation: What ever service is active in requested zone will Pause
  6.  I want to: Turn on a service in an AV zone (audio or video)
      * You say: alexa ask Savant to Turn on Sonos in Kitchen
      * alexa Responds: “Turning on Sonos in Kitchen
      * Expectation: powerOn workflow will be run for service matching request
      * Note: User can use the alias of a service or the profile name of a service

### Controlling Lighting:
  1.  I want to: Turn on lights in an AV zone
      * You say: “alexa ask Savant to turn on Kitchen lights
      * alexa Responds: “Turning on Kitchen lights”
      * Expectation: Lights which are assigned to the AV zone will turn on (100%), same as if lighting was used from savant app or voice remote
  2. I want to:  Turn off lights in an AV zone
      * You say: alexa ask Savant to turn off Kitchen Lights
      * alexa Responds: “Turning off Kitchen Lights"
      * Expectation: Lights which are assigned to the AV zone will turn off (0%), same as if lighting was used from savant app or voice remote
  3. I want to: Set the lights in an AV zone by percentage
      * You say: alexa ask Savant to set lights in Kitchen to 50%
      * alexa Responds: “Setting volume to 50 percent"
      * Expectation: AV zone lights will adjust to requested percentage.
  4.  I want to: Set lights in an av zone high, medium, low
      * You say: alexa ask Savant to set kitchen lights to medium
      * alexa Responds: “Setting lights to medium"
      * Expectation: AV zone Lights will adjust to a preset level, by default medium is 50%

### Controlling Volume:
  1. I want to: Set the volume of an AV zone by percentage
      * You say: alexa ask Savant to set volume in Kitchen to 50%
      * alexa Responds: “Setting volume to 50 percent"
      * Expectation: AV zone volume will adjust to requested percentage.
      * Note:There is no intelligence in this action, if the user is in a zone with high gain and 50% is too loud, the user is going to get something that is too loud.  It is to be expected that the user would need to know comfortable percentages based on that zone
  2.  I want to: Set Volume of an av zone high, medium, low
      * You say: alexa ask Savant to set kitchen volume to medium
      * alexa Responds: “Setting Volume to medium"
      * Expectation: AV zone volume will adjust to a preset level, by default medium is 50%
      * Note:There is no intelligence in this action, if the user is in a zone with high gain and medium is too loud, the user is going to get something that is too loud.  It is to be expected that the user would need to know comfortable presets based on that zone.
  3.  I want to: Lower volume of an AV zone
      * You say: alexa ask Savant to make Kitchen Lower
      * alexa Responds: "Lowering volume in Kitchen"
      * Expectation: AV zone volume will be reduced 12%
  4.  I want to: Lower volume in an AV zone by a larger percentage
      * You say: alexa ask Savant to make Kitchen much lower
      * alexa Responds: "Lowering volume a lot in Kitchen”
      * Expectation: AV zone volume will be reduced 40%
  5.  I want to: Raise volume of an AV zone
      * You say: alexa ask Savant to make Kitchen louder
      * alexa Responds: “Increasing volume in Kitchen"
      * Expectation: AV zone volume will be increased 12%
  6.  I want to: Raise volume in an AV zone by a larger percentage
      * You say: alexa ask Savant to make Kitchen much louder
      * alexa Responds: “Increasing volume a lot in Kitchen”
      * Expectation: AV zone volume will be increased 40%
      * Note:There is no intelligence in this action, if the user is in a zone is already at 60% this action will bring it to 100%

### Controlling Sleep Timer:
  1.  I want to: Turn sleep timer on in a zone
      * You say: alexa ask Savant to set sleep timer for 15 minute in Kitchen
      * alexa Responds: “Sleep timer set for 15 minutes"
      * Expectation: Savant’s zone sleep timer will turn on for requested amount of time
  2.  I want to: Extend sleep timer
      * You say: alexa ask Savant to add 10 minutes to timer in Kitchen
      * alexa Responds: “Adding 10 more minutes in Kitchen"
      * Expectation: Sleep timer will increment by requested amount
  3.  I want to: Turn off sleep timer
      * You say: alexa ask Savant toStop sleep timer in Kitchen
      * alexa Responds: “Sleep timer disabled in Kitchen
      * Expectation: Sleep timer stops in desired zone

### Controlling Climate:
  1.  I want to: Know the current temperature in the home
      * You say: alexa ask Savant What is the current temperature
      * alexa Responds: “it is currently 70 degrees inside"
      * Expectation: get the current zone temperature
  2.  I want to: Know what mode the thermostat is in
      * You say: alexa ask Savant if the heat is on?
      * alexa Responds: “The system is currently set to heat"
      * Expectation: thermostat will respond with current mode, cool, heat, auto, off
  3.  I want to: know the current heat point
      * You say: alexa ask Savant what the heat is set to
      * alexa Responds: “The heat is currently set to 70 degrees"
      * Expectation: Thermostat responds with current heat point
  4.  I want to: Know the current cool point
      * You say: alexa ask Savant what the AC is set to
      * alexa Responds: “The AC is currently set to 68 degrees"
      * Expectation: Thermostat will second with current cool point
  5.  I want to: Set HVAC mode
      * You say: alexa ask Savant to set system to heat
      * alexa Responds: “Setting system mode to heat"
      * Expectation: Set thermostat mode, Cool, heat, auto, off, on
  6.  I want to: set heat point
      * You say: alexa ask Savant set heat to 70 degrees
      * alexa Responds: “Setting heat to 70 degrees"
      * Expectation: thermostat heat set point will change to requested value
  7.  I want to: set cool point
      * You say: alexa ask Savant set heat to 75 degrees
      * alexa Responds: “Setting AC to 75 degrees"
      * Expectation:  thermostat cool set point will change to requested value
