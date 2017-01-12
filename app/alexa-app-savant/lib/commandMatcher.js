const
  didYouMean = require('didyoumean'),
  q = require('q');

//app.dictionary.serviceCommands

function commandMatcher(requestedCommand){
  var defer = q.defer();
  console.log('looking for: '+requestedCommand)
  switch (requestedCommand.toLowerCase()){
    case "up":
      serviceCommand = "OSDCursorUp"
      break;
    case "down":
      serviceCommand = "OSDCursorDown"
      break;
    case "left":
      serviceCommand = "OSDCursorLeft"
      break;
    case "right":
      serviceCommand = "OSDCursorRight"
      break;
    case "ok":
      serviceCommand = "OSDSelect"
      break;
    case "enter":
      serviceCommand = "OSDSelect"
      break;
    case "select":
      serviceCommand = "OSDSelect"
      break;
    case "play":
      serviceCommand = "Play"
      break;
    case "pause":
      serviceCommand = "Pause"
      break;
    case "exit":
      serviceCommand = "Exit"
      break;
    case "back":
      serviceCommand = "Exit"
      break;
    case "return":
      serviceCommand = "Exit"
      break;
    case "turn off":
      serviceCommand = "PowerOff"
      break;
    case "off":
      serviceCommand = "PowerOff"
      break;
    case "turn on":
      serviceCommand = "PowerOn"
      break;
    case "on":
      serviceCommand = "PowerOn"
      break;
    default:
      var err = "I did not understand what command you wanted, Please try again"
      defer.reject(err);
      return defer.promise
      break;
  }
  defer.resolve(serviceCommand);
  return defer.promise
}

module.exports = {
  commandMatcher:commandMatcher
}
