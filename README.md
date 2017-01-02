# alexa-app-savant

An alexa-app app to control Savant systems

## Intro
Ready to get started? The alexa-app-savant app make things pretty easy but there are still quite a few steps. no one action is difficult but there is some advanced stuff going on under the hood.  Stick to the instructions and you’ll be just fine. If you get stuck shoot me an email.

**Note: The setup script for the smart host is not really ready for prime time. Generally it all works, but there are issues with restoring the service after reboot and the redirect of the secure server port. I recommend using the pro host only at this time, however, if you are feeling adventurous give the smart host a shot.**

## Get Ready
* **Sign up for amazon Developer account**
    * You will want to use the same amazon account which is attached to your alexa device
    * https://developer.amazon.com/
    * You will need to have a credit card attached to your amazon account.  But don’t worry, amazon does not charge for any service we will use to setup alexa.
* **Download and install Node.JS on Savant Host**
    * Pro
        * https://nodejs.org/en/
        * Install 6.9.2, or whichever version is labeled “ Recommended for Most Users"
    * Smart (In terminal on the host)
        * sudo apt-get update
        * sudo apt-get install curl
        * curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
        * sudo apt-get install -y nodejs
* **Network setup**
    * You will need to know your DNS or external ip address in the next version. take note of that now
    * Will need to forward port 443 to your host
        * use service if you can’t
            * https://localtunnel.github.io/www/

## Install on Host
#### Pro Host Install
cd ~/Downloads && curl --remote-name http://28seven.net/alexa-app-savant/mac_setup.sh && chmod a+x mac_setup.sh && sudo ./mac_setup.sh

#### Smart Host Install
cd /home/RPM && curl --remote-name http://28seven.net/alexa-app-savant/smart_setup.sh && chmod a+x smart_setup.sh && sudo ./smart_setup.sh

#### Information
Install of the app is all done with the small script above, just run it in the terminal on the host(copy/paste into terminal and push enter). Make sure you run setup script for your type of host

The install on the host is completely automated. A lot of stuff is about to happen. Just a quick peak behind the scenes. (you can see the script [here](https://gitlab.com/twentyeight7/alexa-app-savant/blob/master/setup/mac_setup.sh)).

  1. Make install directory ’/alexa-app-savant’
  2. Download alexa-savant and watchdog service from [npm](https://www.npmjs.com/package/alexa-app-savant)
  3. Move components around
  4. Install all the dependencies (this is built on top of [alexa-app](https://www.npmjs.com/package/alexa-app))
  5. Install a launch agent so the service will start with boot
  6. generate SSL certificates and put them in the right place. A copy is also placed on your desktop, you will need it later.
  7. Start the watchdog service
  8. setup the IP routing (port 1414 => 443)

During the install you will be prompted for information to setup the ssl certs, you can skip the entry of everything (just push enter) except for the prompt about your "fully qualified domain name (FQDN)", at that point you will need to put in the DNS or WAN IP address of the network your Savant host is on.

#### Verify
When the script is complete you will want to check two things

  1. there are 3 new files on your desktop
      * private-key.pem
      * cert.cer
      * alexaLog-0.log
  2. there is now a webpage served at http://localhost:4141/alexa/savant (look at this on the host, otherwise do: http://<< Host IP >>:4141/alexa/savant).


## Setup Skill
  1. **Create skill on developer.amazon.com**
      1. Select "ALEXA" from top menu
      2. Click "Get Started >" under "Alexa Skills Kit"
      3. Click "Add New Skill" in upper right corner
  2. **Configure Skill**
      1. **Skill Information**
          1. Skill type: "Custom Interaction Model"
          2. Name: "Savant" (can be set to anything)
          3. Invocation Name: "Savant"  (The word you say to start the request. "Alexa Tell Savant", Savant is the invocation name.)
      2. **Interaction Model**
          1. The skill uses "Custom Slot Types". Because of a quirk in the way the interaction model page works, we need to pre fill the intent and utterance boxes to be able to generate the interaction model.
          2. All content for the Interaction model is generated for you and can be found in "customSlotTypes.txt' in the host's home folder.
          3. Populate Interaction model ( do not include headers from customSlotTypes.txt):
              1. Copy "Initial Intent Schema"  to "Intent Schema"
              2. Copy "Initial Sample Utterances"  to "Sample Utterances"
              3. Make Custom Slots
                  1. Click "Add Slot Type"
                  2. Copy "Custom Slot Type" to "Enter Type"
                  3. Copy list into "Enter Value" boxes
                  4. Repeat for each custom slot type, there will be 6 in total
            4. Click "Save"
            5. In a new browser window go to: http://<< Host IP >>:4141/alexa/savant  
            6. Copy everything in "Schema" box (it's long) from new window to "Intent Schema" on the amazon page
            7. Copy everything in "Utterances" box (it's long) from new window to "Sample Utterances" on the amazon page
            8. Click "Next"
      3. **Configuration**
          1. Select "HTTPS"
          2. Select North America (or Europe if thats where you're at)
          3. Enter your skill address in box below region "https:// << WAN DNS >> /alexa/savant"
              1. Make sure the WAN address you set here matches what you used during initial setup when creating your SSL cert.
              2. Make sure you use "https" amazon requires a secure connection.
          4. Click "Next"
      4. **SSL Certificate**
          1. Open cert.cer in a text editor (located on desktop of Pro Host or home folder of Smart Host)
          2. Copy entire contents including the first and last lines
          3. On the amazon page select "I will upload a self-signed certificate in X.509 format."
          4. Paste contents of cert.cer into box
          5. Click "Next"
      5. **Enable skill**
          1. In alexa app go to:
              1. Menu
              2. "Skills"
              3. "Your Skills"
              4. Click skill which was just created
              5. Click "Enable"
      6. **Test (text)**
          1. On the Amazon Developer Page go to "Test"
          2. In the "Enter Utterance" box type: savant (or whatever you used for your utterance)
          3. Click "Ask Savant" ("Savant" will be what ever you named your skill)
          4. The "Service Response" box will show a properly formatted response with the contents "Welcome to your Savant System"
          5. If the skill is not working then it will return "The remote endpoint could not be called, or the response it returned was invalid."
  3. **Troubleshoot**
      1. **Make sure skill is running**
          1. Check skill page  - If you cant resolve a page at this address skill is not running
              1. http://localhost:4141/alexa/savant or http:// << host IP >> :4141/alexa/savant
          2. Check secure skill page - If you cant resolve a page at this address skill is not running or the secure side of the skill failed to boot. The app by default uses 1414 for its secure port however amazon requires use of the standard 443 port (this is done as not to require raised privileges to run). the install script redirects incoming requests to 443 to the server at 1414. this process may have failed depending on OS version.
              1. https://localhost/alexa/savant or https:// << host IP >> /alexa/savant
              2. If having a problem: https://localhost:1414/alexa/savant or https:// << host IP >> :1414/alexa/savant
          3. Check alexaLog.log (Pro host: Desktop, Smart Host: Home Folder)
              1. When the skill boots it imports all intents and loads some states from State Center. The last line in the log of a properly booted system should be "Recalling currentZone from Savant:false"
              2. If something is failing during the boot it will be in the log, often this is due to a failed install of a dependency
      2. **Check network config**
          1. Make sure that port 443 is forwarded to the savant host static or reserved IP. you should be able to resolve your skill's secure page
            1. connect to https:// << WAN DNS >> /alexa/savant


## Utterance Usage
See all these in action [here](http://www.28seven.net/christopherclark/2016/12/20/alexa-app-savant-feature-set/)

#### Getting Started:
1. **I want to: Make sure that alexa-skill-app is connected and running**
    * You say: alexa tell Savant
    * alexa Responds: "Welcome to your Savant System”
    * Expectation: none, this will only provide the acknowledgment that the systems are connected
2.  **I want to: reboot alexa-app-savant skill**
    * You say: alexa tell Savant to reboot
    * alexa Responds: I’ll be back"
    * Expectation:  skill will reboot, very helpful during testing and programming to load

#### Controlling AV:
1. **I want to: Turn off all AV Zones**
    * You say: alexa ask Savant to turn off all zones
    * alexa Responds: “Turning off all zones”
    * Expectation: The zone will turn off , TV and sound.
2. **I want to: Turn off an AV Zone**
    * You say: alexa ask Savant to turn off kitchen
    * alexa Responds: “Turning off Kitchen”
    * Expectation: The desired AV zone will turn off, TV and sound.
3. **I want to: Turn on an AV Zone**
    * You say: alexa ask Savant to turn on Kitchen
    * alexa Responds: "Turning on <<service name>> in Kitchen
    * Expectation: Savant system will follow powerOn workflow for the last used service in zone
    * Exception: If there was not a perviously used service in the zone (Kitchen.LastActiveService is empty) then it will respond: "No previous service. Please say which service to turn on"
4. **I want to: send the play command to an AV zone**
    * You say: alexa ask Savant to send play command in Kitchen
    * alexa Responds: “Play"
    * Expectation: what ever service is active in requested zone will Play
5.  **I want to: send the pause command to an AV zone**
    * You say: alexa ask Savant to pause  Kitchen
    * alexa Responds: “Pause"
    * Expectation: What ever service is active in requested zone will Pause
6.  **I want to: Turn on a service in an AV zone (audio or video)**
    * You say: alexa ask Savant to Turn on Sonos in Kitchen
    * alexa Responds: “Turning on Sonos in Kitchen
    * Expectation: powerOn workflow will be run for service matching request
    * Note: User can use the alias of a service or the profile name of a service

#### Controlling Lighting:
1.  **I want to: Turn on lights in an AV zone**
    * You say: “alexa ask Savant to turn on Kitchen lights
    * alexa Responds: “Turning on Kitchen lights”
    * Expectation: Lights which are assigned to the AV zone will turn on (100%), same as if lighting was used from savant app or voice remote
2. **I want to:  Turn off lights in an AV zone**
    * You say: alexa ask Savant to turn off Kitchen Lights
    * alexa Responds: “Turning off Kitchen Lights"
    * Expectation: Lights which are assigned to the AV zone will turn off (0%), same as if lighting was used from savant app or voice remote
3. **I want to: Set the lights in an AV zone by percentage**
    * You say: alexa ask Savant to set lights in Kitchen to 50%
    * alexa Responds: “Setting volume to 50 percent"
    * Expectation: AV zone lights will adjust to requested percentage.
4.  **I want to: Set lights in an av zone high, medium, low**
    * You say: alexa ask Savant to set kitchen lights to medium
    * alexa Responds: “Setting lights to medium"
    * Expectation: AV zone Lights will adjust to a preset level, by default medium is 50%

#### Controlling Volume:
1. **I want to: Set the volume of an AV zone by percentage**
    * You say: alexa ask Savant to set volume in Kitchen to 50%
    * alexa Responds: “Setting volume to 50 percent"
    * Expectation: AV zone volume will adjust to requested percentage.
    * Note:There is no intelligence in this action, if the user is in a zone with high gain and 50% is too loud, the user is going to get something that is too loud.  It is to be expected that the user would need to know comfortable percentages based on that zone
2.  **I want to: Set Volume of an av zone high, medium, low**
    * You say: alexa ask Savant to set kitchen volume to medium
    * alexa Responds: “Setting Volume to medium"
    * Expectation: AV zone volume will adjust to a preset level, by default medium is 50%
    * Note:There is no intelligence in this action, if the user is in a zone with high gain and medium is too loud, the user is going to get something that is too loud.  It is to be expected that the user would need to know comfortable presets based on that zone.
3.  **I want to: Lower volume of an AV zone**
    * You say: alexa ask Savant to make Kitchen Lower
    * alexa Responds: "Lowering volume in Kitchen"
    * Expectation: AV zone volume will be reduced 12%
4. **I want to: Lower volume in an AV zone by a larger percentage**
    * You say: alexa ask Savant to make Kitchen much lower
    * alexa Responds: "Lowering volume a lot in Kitchen”
    * Expectation: AV zone volume will be reduced 40%
5. **I want to: Raise volume of an AV zone**
    * You say: alexa ask Savant to make Kitchen louder
    * alexa Responds: “Increasing volume in Kitchen"
    * Expectation: AV zone volume will be increased 12%
6.  **I want to: Raise volume in an AV zone by a larger percentage**
    * You say: alexa ask Savant to make Kitchen much louder
    * alexa Responds: “Increasing volume a lot in Kitchen”
    * Expectation: AV zone volume will be increased 40%
    * Note:There is no intelligence in this action, if the user is in a zone is already at 60% this action will bring it to 100%

#### Controlling Sleep Timer:
1.  **I want to: Turn sleep timer on in a zone**
    * You say: alexa ask Savant to set sleep timer for 15 minute in Kitchen
    * alexa Responds: “Sleep timer set for 15 minutes"
    * Expectation: Savant’s zone sleep timer will turn on for requested amount of time
2.  **I want to: Extend sleep timer**
    * You say: alexa ask Savant to add 10 minutes to timer in Kitchen
    * alexa Responds: “Adding 10 more minutes in Kitchen"
    * Expectation: Sleep timer will increment by requested amount
3.  **I want to: Turn off sleep timer**
    * You say: alexa ask Savant toStop sleep timer in Kitchen
    * alexa Responds: “Sleep timer disabled in Kitchen
    * Expectation: Sleep timer stops in desired zone

#### Controlling Climate:
1.  **I want to: Know the current temperature in the home**
    * You say: alexa ask Savant What is the current temperature
    * alexa Responds: “it is currently 70 degrees inside"
    * Expectation: get the current zone temperature
2.  **I want to: Know what mode the thermostat is in**
    * You say: alexa ask Savant if the heat is on?
    * alexa Responds: “The system is currently set to heat"
    * Expectation: thermostat will respond with current mode, cool, heat, auto, off
3.  **I want to: know the current heat point**
    * You say: alexa ask Savant what the heat is set to
    * alexa Responds: “The heat is currently set to 70 degrees"
    * Expectation: Thermostat responds with current heat point
4.  **I want to: Know the current cool point**
    * You say: alexa ask Savant what the AC is set to
    * alexa Responds: “The AC is currently set to 68 degrees"
    * Expectation: Thermostat will second with current cool point
5.  **I want to: Set HVAC mode**
    * You say: alexa ask Savant to set system to heat
    * alexa Responds: “Setting system mode to heat"
    * Expectation: Set thermostat mode, Cool, heat, auto, off, on
6.  **I want to: set heat point**
    * You say: alexa ask Savant set heat to 70 degrees
    * alexa Responds: “Setting heat to 70 degrees"
    * Expectation: thermostat heat set point will change to requested value
7.  **I want to: set cool point**
    * You say: alexa ask Savant set heat to 75 degrees
    * alexa Responds: “Setting AC to 75 degrees"
    * Expectation:  thermostat cool set point will change to requested value
