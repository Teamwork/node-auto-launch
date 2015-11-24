var applescript, tellTo;

applescript = require('applescript');

tellTo = 'tell application "System Events" to ';

module.exports = {
  enable: (function(_this) {
    return function(opts, cb) {
      var command, isHidden, properties;
      isHidden = opts.isHiddenOnLaunch ? 'false' : 'true';
      properties = "{path:\"" + opts.appPath + "\", hidden:" + isHidden + ", name:\"" + opts.appName + "\"}";
      command = tellTo + 'make login item at end with properties ' + properties;
      return applescript.execString(command, cb);
    };
  })(this),
  disable: (function(_this) {
    return function(opts, cb) {
      var command;
      command = tellTo + ("delete login item \"" + opts.appName + "\"");
      return applescript.execString(command, cb);
    };
  })(this),
  isEnabled: (function(_this) {
    return function(opts, cb) {
      var command;
      command = tellTo + "get the name of every login item";
      return applescript.execString(command, function(err, loginItems) {
        if (loginItems == null) {
          return false;
        }
        return cb(loginItems.indexOf(opts.appName) > -1);
      });
    };
  })(this)
};
