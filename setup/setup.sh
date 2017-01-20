#!/bin/bash

#*****************
#****** Functions
#*****************



installMac() {
  # Make directory and download skill, move files in correct location
  mkdir ~/alexa-app-savant
  cd ~/alexa-app-savant
  sudo npm install alexa-app-savant --save
  cp -a ~/alexa-app-savant/node_modules/alexa-app-savant/. ~/alexa-app-savant
  mkdir ~/alexa-app-savant/node_modules/alexa-app-server/sslcert
  mkdir ~/alexa-app-savant/app/alexa-app-savant/userIntents/

  cd ~/alexa-app-savant/app/alexa-app-savant
  sudo npm install --save

  #install pm2 to keep script alive
  sudo npm install pm2 -g

  #install launch agent to start on boot
  cp ~/alexa-app-savant/setup/com.alexaskill.plist ~/Library/LaunchAgents

  if [ -f ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem ]; then
    echo Certs already exist... skipping
  else
    echo Could not find certs. Making them now...
    #Generate ssh key and cert, put in folder for server use
    openssl genrsa -out ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem 1024
    openssl req -new -x509 -key ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem -out ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer -days 365
    #copy key and cert to desktop for later use
    cp ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem ~/Desktop/
    cp ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer ~/Desktop/
  fi

  #cleanup
  rm -f ~/alexa-app-savant/server/.DS_Store

  #modify server index.js with key location
  sed -i .bak -e "s|'sslcert/'|__dirname+'/sslcert/'|g" ~/alexa-app-savant/node_modules/alexa-app-server/index.js

  #start server
  pm2 start ~/alexa-app-savant/index.js -l ~/Desktop/alexaLog.log

  #redirect port 1414
  #older osx
  sudo ipfw add 1 forward 127.0.0.1,1414 ip from any to any 443 in
  #newer osx
  echo "
  rdr pass inet proto tcp from any to any port 443 -> 127.0.0.1 port 1414
  " | sudo pfctl -ef -

  # start pm2 on boot and save config
  sudo pm2 startup
  sudo pm2 save

  ip="$(ipconfig getifaddr en0)"
  echo "-------------------------------------------------------------------------------"
  echo ""
  echo "Install complete."
  echo "In your brower go to http://$ip:4141/alexa/savant to check if service is running"
  echo ""
  runloop=false
}
installLinux(){
  # check if its a smart host with control
  if [ -f /etc/debian_version ]; then
    echo debian Smart Host
  else
    echo Smart Host with Control
    if [ -f /usr/local/bin/node ]; then
      echo Node Installed Already Skipping...
    else
      echo Could not find node, installing now...
      mkdir /home/RPM/temp
      cd /home/RPM/temp
      wget http://nodejs.org/dist/v6.9.3/node-v6.9.3-linux-armv7l.tar.gz
      cd /usr/local
      sudo tar --strip-components 1 -xzf /home/RPM/temp/node-v6.9.3-linux-armv7l.tar.gz
      rm -rf /home/RPM/temp
    fi
  fi

  # Make directory and download skill, move files in correct location
  mkdir /home/RPM/alexa-app-savant
  cd /home/RPM/alexa-app-savant
  sudo npm install alexa-app-savant --save
  cp -a /home/RPM/alexa-app-savant/node_modules/alexa-app-savant/. /home/RPM/alexa-app-savant
  mkdir /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert
  mkdir /home/RPM/alexa-app-savant/app/alexa-app-savant/userIntents/

  cd /home/RPM/alexa-app-savant/app/alexa-app-savant
  sudo npm install --save

  #install pm2 to keep script alive
  sudo sudo npm install pm2 -g

  #Generate ssh key and cert, put in folder for server use
  if [ -f /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem ]; then
    echo Certs already exist... skipping
  else
    echo Could not find certs. Making them now...
    openssl genrsa -out /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem 1024
    openssl req -new -x509 -key /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem -out /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer -days 365
    #copy key and cert to home folder for later use
    cp /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem /home/RPM/
    cp /home/RPM/alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer /home/RPM/
  fi

  #modify server index.js with key location
  sed -i -e "s|'sslcert/'|__dirname+'/sslcert/'|g" /home/RPM/alexa-app-savant/node_modules/alexa-app-server/index.js

  #start server
  pm2 start /home/RPM/alexa-app-savant/index.js -l /home/RPM/alexaLog.log


  #redirect port 1414
  sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 1414
  sudo iptables-save > ~/iptables

  # start pm2 on boot and save config
  sudo pm2 startup
  sudo pm2 save

  ip="$(ifconfig | grep -A 1 'eth0' | tail -1 | cut -d ':' -f 2 | cut -d ' ' -f 1)"
  echo "-------------------------------------------------------------------------------"
  echo ""
  echo "Install complete."
  echo "In your brower go to http://$ip:4141/alexa/savant to see if service is running"
  echo ""
  runloop=false
}
installPlatform(){
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Installing on Pro Host...."
    installMac

    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Installing on Smart Host...."
    installLinux
  fi
}

backupMac() {
  if [ -d ~/alexa-app-savant ]; then
    echo "Backing up user files..."
    backupFolder='alexa-app-savant-Backup/'$(date +%Y%m%d_%H%M%S)
    if [ ! -d ~/alexa-app-savant-Backup ]; then
      echo "Making backup directory..."
      mkdir ~/alexa-app-savant-Backup
      mkdir -p ~/$backupFolder
      echo "Backing up files to ~/$backupFolder ..."
    else
      mkdir -p ~/$backupFolder
      echo "Backing up files to ~/$backupFolder ..."
    fi

    if [ -d ~/alexa-app-savant/app/alexa-app-savant/userIntents ]; then
      echo "Backing up userIntets"
      sudo cp -R ~/alexa-app-savant/app/alexa-app-savant/userIntents ~/$backupFolder
    else
      echo "WARNING could not find userIntents"
      mkdir ~/$backupFolder/userIntents
    fi
    if [ -d ~/alexa-app-savant/app/alexa-app-savant/userFiles ]; then
      echo "Backing up userFiles"
      sudo cp -R ~/alexa-app-savant/app/alexa-app-savant/userFiles ~/$backupFolder
    else
      echo "WARNING could not find userFiles"
      mkdir ~/$backupFolder/userFiles
    fi
    if [ -f ~/alexa-app-savant/app/alexa-app-savant/lib/config.js ]; then
      echo "Backing up config.js from legacy location"
      sudo cp -R ~/alexa-app-savant/app/alexa-app-savant/lib/config.js ~/$backupFolder/userFiles/config.js
    fi
    if [ -d ~/alexa-app-savant/node_modules/alexa-app-server/sslcert ]; then
      echo "Backing up sslcerts"
      sudo cp -R ~/alexa-app-savant/node_modules/alexa-app-server/sslcert ~/$backupFolder
    else
      echo "WARNING could not find userFiles"
      mkdir ~/$backupFolder/userFiles
    fi
    runloop=false
  else
    echo "Can not find alexa-app-savant in home folder, quitting."
    exit
  fi
}
backupLinux() {
  backupMac
}
backupPlatform(){
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Backing up on Pro Host...."
    backupMac

    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Backing up on Smart Host...."
    backupLinux
  fi
}

updateMac() {
  if [ -d ~/alexa-app-savant ]; then
    backupMac
    cd ~/alexa-app-savant
    echo "Getting update from NPM..."
    sudo npm update
    echo "Moving files into place..."
    cp -a ~/alexa-app-savant/node_modules/alexa-app-savant/. ~/alexa-app-savant
    restorePlatform
    runloop=false
  else
    echo "Can not find alexa-app-savant in home folder, quitting."
    exit
  fi

}
updateLinux() {
  updateMac
}

restoreMac() {
  if [ -z "$latestBackup" ]; then
    echo "Locating latest backup..."
    if [ -d ~/alexa-app-savant-Backup ]; then
      cd ~/alexa-app-savant-Backup
    else
      echo "Could not locate backups please create backup before trying to restore."
      exit
    fi
    latestBackup='alexa-app-savant-Backup/'$(ls | sort -n -t _ -k 2 | tail -1)''
  fi
  echo "Restoring user userIntents..."
  cp -R ~/$latestBackup/userIntents ~/alexa-app-savant/app/alexa-app-savant
  echo "Restoring user userFiles..."
  cp -R ~/$latestBackup/userFiles ~/alexa-app-savant/app/alexa-app-savant
  echo "Restoring user sslcerts..."
  cp -R ~/$latestBackup/sslcert ~/alexa-app-savant/node_modules/alexa-app-server
  runloop=false
}
restoreLinux() {
  restoreMac
}
restorePlatform(){
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Restoring on Pro Host...."
    restoreMac

    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Restoring on Smart Host...."
    restoreLinux
  fi
}

uninstallMac() {
  echo "Stopping Skill..."
  sudo pm2 stop all
  echo "Stopping Watchdog..."
  sudo pm2 kill
  echo "Removing Logs..."
  sudo rm ~/Desktop/alexaLog*.log
  echo "Removing private-key.pem copy..."
  sudo rm ~/Desktop/private-key.pem
  echo "Removing cert.cer copy..."
  sudo rm ~/Desktop/cert.cer
  echo "Removing LaunchAgents..."
  sudo rm ~/Library/LaunchAgents/com.alexaskill.plist
  sudo rm ~/Library/LaunchAgents/PM2.plist
  echo "Removing watchdog config..."
  sudo rm -rf ~/.pm2
  backupPlatform
  echo "Removing Skill..."
  sudo rm -rf ~/alexa-app-savant
  echo ""
  runloop=false
}
uninstallLinux() {
  echo "Stopping Skill..."
  sudo pm2 stop all
  echo "Stopping Watchdog..."
  sudo pm2 kill
  echo "Removing Logs..."
  sudo rm ~/alexaLog*.log
  echo "Removing private-key.pem copy..."
  sudo rm ~/private-key.pem
  echo "Removing cert.cer copy..."
  sudo rm ~/cert.cer
  echo "Removing upstart..."
  sudo rm /etc/init.d/pm2
  backupPlatform
  echo "Removing watchdog config..."
  sudo rm -rf ~/.pm2
  echo "Removing Skill..."
  sudo rm -rf ~/alexa-app-savant
  echo ""
  runloop=false
}
uninstallPlatform(){
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Uninstall on Pro Host...."
    uninstallMac

    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Uninstall on Smart Host...."
    uninstallLinux
  fi
}

certMac() {
  backupPlatform
  echo "Removing private-key.pem..."
  sudo rm ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem
  echo "Removing cert.cer..."
  sudo rm ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer
  echo "Removing private-key.pem copy..."
  sudo rm ~/Desktop/private-key.pem
  echo "Removing cert.cer copy..."
  sudo rm ~/Desktop/cert.cer
  #Generate ssh key and cert, put in folder for server use
  openssl genrsa -out ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem 1024
  echo "Moving new certificate to server sslcert directory..."
  openssl req -new -x509 -key ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem -out ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer -days 365
  echo ""
  echo "Copying new certificate to Desktop..."
  cp ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem ~/Desktop/
  cp ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer ~/Desktop/
  echo ""
  echo "!!! NOTE !!!"
  echo "New certficate created. Copy entire contents of ~/cert.cer into amazon configuration page"
  runloop=false
}
certLinux() {
  backupPlatform
  echo "Removing private-key.pem..."
  sudo rm ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem
  echo "Removing cert.cer..."
  sudo rm ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer
  echo "Removing private-key.pem copy..."
  sudo rm ~/private-key.pem
  echo "Removing cert.cer copy..."
  sudo rm ~/cert.cer
  #Generate ssh key and cert, put in folder for server use
  openssl genrsa -out ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem 1024
  echo "Moving new certificate to server sslcert directory..."
  openssl req -new -x509 -key ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem -out ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer -days 365
  echo ""
  echo "Copying new certificate to home directory..."
  cp ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/private-key.pem ~/
  cp ~/alexa-app-savant/node_modules/alexa-app-server/sslcert/cert.cer ~/
  echo ""
  echo "!!! NOTE !!!"
  echo "New certficate created. Copy entire contents of ~/cert.cer into amazon configuration page"
  runloop=false
}
certPlatform(){
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Making a new certificate on Pro Host...."
    certMac

    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Making a new certificate Smart Host...."
    certLinux
  fi
}
#*****************
#****** Menu
#*****************

clear
echo "Platform: $OSTYPE               "
echo "       _                        "
echo "      | |                       "
echo "  __ _| | _____  ____ _         "
echo " / _' | |/ _ \ \/ / _' |        "
echo "| (_| | |  __/>  < (_| |        "
echo " \__,_|_|\___/_/\_\__,_|        "
echo " / _' | '_ \| '_ \              "
echo "| (_| | |_) | |_) |             "
echo " \__,_| .__/| .__/          _   "
echo "      | |   | |            | |  "
echo " ___  |_|___|_|____ _ _ __ | |_ "
echo "/ __|/ _' \ \ / / _' | '_ \| __|"
echo "\__ \ (_| |\ V / (_| | | | | |_ "
echo "|___/\__,_| \_/ \__,_|_| |_|\__|"
echo "                                "
echo "                                "


echo "Please choose action: "
options=("Install" "Update" "Backup" "Restore" "New Certificate" "Uninstall" "Quit")
select opt in "${options[@]}"
do
    case $opt in
        "Install")
            if [ ! -d ~/alexa-app-savant ]; then
              installPlatform
            else
            echo "--"
            echo ""
            echo "!!! WARNING !!!"
            echo "alexa-app-savant is already installed!"
            echo "If you continue with install user files may not be preserved."
            echo ""
            read -p "Are you sure you want to continue install? " yn
            case $yn in
                [Yy]* ) installPlatform;;
                [Nn]* ) exit;;
                * ) echo "Please answer yes or no.";;
            esac
            fi
            echo "done."
            exit
            ;;
        "Update")
            if [[ "$OSTYPE" == "darwin"* ]]; then
              echo "--"
              echo "Updating on Pro Host...."
              updateMac

              elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
              echo "--"
              echo "Updating on Smart Host...."
              updateLinux
            fi
            echo "done."
            exit
            ;;
        "Backup")
            backupPlatform
            echo "Done."
            exit
            ;;
        "New Certificate")
            certPlatform
            echo "Done."
            exit
            ;;
        "Restore")
            if [ -d ~/alexa-app-savant ]; then
              echo "Locating latest backup..."
              if [ -d ~/alexa-app-savant-Backup ]; then
                cd ~/alexa-app-savant-Backup
              else
                echo "Could not locate backups please create backup before trying to restore."
                exit
              fi
              latestBackup='alexa-app-savant-Backup/'$(ls | sort -n -t _ -k 2 | tail -1)''
              echo "Found ~/$latestBackup"
              read -p "Would you like to restore  ~/$latestBackup? " yn
              case $yn in
                  [Yy]* ) restorePlatform;;
                  [Nn]* ) exit;;
                  * ) echo "Please answer yes or no.";;
              esac
              echo "Done."
              exit
            else
              echo "Can not find alexa-app-savant in home folder, quitting."
              exit
            fi
            ;;
        "Uninstall")
            echo "--"
            echo ""
            echo "!!! WARNING !!!"
            echo "This will stop the alexa-app-savant service and delete all non user files."
            echo "All files from the 'userIntents' and 'userFiles' folders will be backed up to '~/alexa-app-savant-Backup'"
            echo "If you have files modified outside of these folders please make sure you manually back them up now."
            echo ""
            runloop=true
            while [ $runloop = true ]; do
              read -p "Are you sure you want to uninstall? " yn
              case $yn in
                  [Yy]* ) uninstallPlatform;;
                  [Nn]* ) exit;;
                  * ) echo "Please answer yes or no.";;
              esac
            done
            echo "Done."
            exit
            ;;
        "Quit")
            break
            ;;
        *) echo invalid option;;
    esac
done
