#!/bin/bash
# Make directory and download skill, move files in correct location
mkdir /alexa-app-savant
cd /alexa-app-savant
npm install alexa-app-savant --save
cp -a /alexa-app-savant/node_modules/alexa-app-savant/. /alexa-app-savant
mkdir /alexa-app-savant/node_modules/alexa-app-server/sslcert
mkdir /alexa-app-savant/app/alexa-app-savant/userIntents/

cd /alexa-app-savant/app/alexa-app-savant
npm install --save

#Generate ssh key and cert, put in folder for server use
openssl genrsa -out /alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem 1024
openssl req -new -x509 -key /alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem -out /alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer -days 365
#copy key and cert to desktop for later use
cp /alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem ~/Desktop/
cp /alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer ~/Desktop/

#install pm2 to keep script alive
sudo npm install pm2 -g

#install launch agent to start on boot
cp /alexa-app-savant/setup/com.alexaskill.plist $Home/Library/LaunchAgents

#cleanup
rm -f /alexa-app-savant/server/.DS_Store

#modify server with key location
sed -i .bak -e "s|'sslcert/'|__dirname+'/sslcert/'|g" /alexa-app-savant/node_modules/alexa-app-server/index.js

#start server
pm2 start /alexa-app-savant/index.js -l ~/Desktop/alexaLog.log

#redirect port 1414
sudo ipfw add 1 forward 127.0.0.1,1414 ip from any to any 443 in
