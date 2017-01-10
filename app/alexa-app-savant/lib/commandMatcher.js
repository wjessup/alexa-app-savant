const
  didYouMean = require('didyoumean'),
  q = require('q');

//app.dictionary.serviceCommands

function commandMatcher(requestedCommand){
  var defer = q.defer();

  switch (requestedCommand.toLowerCase()){
    case "up":
      serviceCommand = "OSDCursorUP"
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
    case "Pause":
      serviceCommand = "Pause"
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
