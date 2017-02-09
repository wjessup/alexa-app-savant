# alexa-app-savant

## Overview
alexa-app-savant provides a way to integrate Savant automation systems into Amazon alexa.

## Documentation
Detailed documentation about alexa-app-savant can be found here:
https://tree.taiga.io/project/twentyeight7-alexa-app-savant/wiki/home

## Install
alexa-app-savant is installed with an automated setup script. Do not install directly with NPM. Installation is preformed on the Savant Host that you would like to integrate with alexa. detailed instruction can be found here: http://www.28seven.net/christopherclark/go/install-skill/

# Skill usage

Calling the Skill
--
When making a request to alexa, the skill's invocation name must be included. This guide assumes that the skill was configured with the invocation name "savant". However, if this differs in your implementation; make sure the invocation name entered while configuring the alexa interaction model is used.

>##### Say: "alexa tell savant"
>######alexa Responds: "Welcome to your Savant System”
>######Expectation: none, this will only provide the acknowledgment that the systems are connected

######

>##### Say: "alexa ask savant"
>######alexa Responds: "Welcome to your Savant System”
>######Expectation: none, this will only provide the acknowledgment that the systems are connected

#####

Zone Control
--
alexa-app-savant is able to control with zone names as well as group names (names set in blueprint “Tools>Organize Zone Groups…”):
>##### Say: "alexa ask savant to turn off << zone name >>
>######alexa Responds: “Turning off << zone name >>”
>######Expectation: The desired AV zone will turn off TV and sound.

######  

>##### Say: "alexa ask savant to turn off << group name >>
>######alexa Responds: “Turning off << group name >>”
>######Expectation: All the AV zones in the desired group will turn off TV and sound.

#####

_Multiple zones and groups can be said together to control multiple zones/groups at once:_
>##### Say: "alexa ask savant to turn off << zone name >>, << zone name >>, and << group name >>
>######alexa Responds: “Turning off << zone name >>, << zone name >>, and << group name >>”
>######Expectation: All the desired AV zones and groups will turn off TV and sound.

###

Single Zone Mode
--
The user has the ability to declare which zone they are currently in, this allows the zone or group name to be left out of the requests made to alexa. If Single Zone Mode is enabled and a zone is provided in the request, alexa will carry out the zone request normally.

#####

_Declare current zone:_
>##### Say: "alexa tell savant I am in the << zone name >>
>######alexa Responds: “Setting location to << zone name >>”
>######Expectation: Single Zone mode is now enabled and will use requested zone

#####

_Use current zone (can be any zone request):_
>##### Say: "alexa tell savant to turn off"
>######alexa Responds: “Turning off << Current Zone >>”
>######Expectation: << Current Zone >> will turn off TV and sound.

#####

_Send command to another zone (can be any zone request):_
>##### Say: "alexa tell savant to turn off << zone name >>"
>######alexa Responds: “Turning off << zone name >>”
>######Expectation: The desired AV zone will turn off TV and sound.

#####

_Disable current zone:_
>##### Say: "alexa tell savant to clear current zone"
>######alexa Responds: “Clearing current zone”
>######Expectation: Single Zone mode is now disabled.

###

Active Service Matching
--
Active service matching allows the user to replace a zone or group name in the alexa request with the name of an already active AV service. If the service "Plex" is active in the "Family Room" both samples below will perform the same action.

####

>##### Say: "alexa tell savant to pause in Family Room
>######alexa Responds: “Pause”
>######Expectation: Pause command is sent to Plex

#####

>##### Say: "alexa tell savant to pause Plex"
>######alexa Responds: “Pause”
>######Expectation: Pause command is sent to Plex

###

User Presets
--
Both Lighting and AV zone volume can be controlled through user preset requests mapped to values for High, Medium, and Low. Users can recall these values per zone with an alexa request:

#####

>##### Say: "alexa ask savant set << zone name >> lights to High"
>######alexa Responds: “setting lights to High in << zone name >>”
>######Expectation: << zone name >> lights will be set to the user preset value stored in << zone name >> High

######

>##### Say: "alexa ask savant set Volume in << zone name >> to low"
>######alexa Responds: “setting volume to low in << zone name >>”
>######Expectation: << zone name >> volume will be set to the user preset value stored in << zone name >> low
###

Users can customize each zone's presets with an alexa request, setting the current zone's state to a preset

#####

>##### Say: "alexa ask savant to save current volume to high in << zone name >>"
>######alexa Responds: “Saving volume preset High in << zone name >>”
>######Expectation: The volume preset high in << zone name >> will be saved to the current volume value

######

>##### Say: "alexa ask savant to save current lighting level to medium in << zone name >>"
>######alexa Responds: “Saving lighting preset medium in << zone name >>”
>######Expectation: The lighting preset medium in << zone name >> will be saved to the current room dim level

###

User preset are defaulted to values when the skill starts for the first time:
Lighting
>######High: 100%
>######Medium: 50%
>######Low: 25%

######

Volume
>######High: 68%
>######Medium: 50%
>######Low: 30%

##### Bulk changes can be made by manually editing the file located in "~/alexa-savant-app/userFiles/userPresets.plist"

# Privacy

alexa-app-savant collects anonymous usage information.  This information is used to better track how the skill is used and what errors occur during usage.  Information is paired with a randomly generated UUID which can not be linked back to a particular person or system.

Users have the ability to opt-out of all information sharing, see [Configuration File](https://tree.taiga.io/project/twentyeight7-alexa-app-savant/wiki/configuration-file).
