#!/bin/bash
# Make directory and download skill, move files in correct location
mkdir /home/RPM/alexa-app-savant
cd /home/RPM/alexa-app-savant
npm install alexa-app-savant --save
cp -a /home/RPM/alexa-app-savant/node_modules/alexa-app-savant/. /home/RPM/alexa-app-savant
mkdir /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert
mkdir /home/RPM/alexa-app-savant/app/alexa-app-savant/userIntents/

cd /home/RPM/alexa-app-savant/app/alexa-app-savant
npm install --save

#install pm2 to keep script alive
sudo npm install pm2 -g

#install launch agent to start on boot
#cp /alexa-app-savant/setup/com.alexaskill.plist /home/RPM/Library/LaunchAgents

#Generate ssh key and cert, put in folder for server use
openssl genrsa -out /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem 1024
openssl req -new -x509 -key /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem -out /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer -days 365
#copy key and cert to home folder for later use
cp /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem /home/RPM/
cp /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer /home/RPM/

#modify server index.js with key location
sed -i -e "s|'sslcert/'|__dirname+'/sslcert/'|g" /home/RPM/alexa-app-savant/node_modules/alexa-app-server/index.js

#start server
pm2 start /home/RPM/alexa-app-savant/index.js -l /home/RPM/alexaLog.log

#redirect port 1414
sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 1414
sudo iptables-save > ~/iptables 
