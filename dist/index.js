var AutoLaunch,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = AutoLaunch = (function() {

  /* Public */
  function AutoLaunch(opts) {
    this.isEnabled = __bind(this.isEnabled, this);
    this.disable = __bind(this.disable, this);
    this.enable = __bind(this.enable, this);
    this.fixOpts = __bind(this.fixOpts, this);
    if (opts.name == null) {
      throw new Error('You must specify a name');
    }
    this.opts = {};
    this.opts.appName = opts.name;
    this.opts.isHiddenOnLaunch = opts.isHidden != null ? opts.isHidden : false;
    this.opts.appPath = opts.path != null ? opts.path : process.execPath;
    this.fixOpts();
    this.api = null;
    if (/^win/.test(process.platform)) {
      this.api = require('./AutoLaunchWindows');
    } else if (/darwin/.test(process.platform)) {
      this.api = require('./AutoLaunchMac');
    } else if (/linux/.test(process.platform)) {
      this.api = require('./AutoLaunchLinux');
    }
  }

  AutoLaunch.prototype.fixNwExecPath = function(path) {
    var possible, possiblePaths, _i, _len;
    possiblePaths = [path.replace('/Contents/Frameworks/node-webkit Helper.app/Contents/MacOS/node-webkit Helper', ''), path.replace('/Contents/Frameworks/nwjs Helper.app/Contents/MacOS/nwjs Helper', '')];
    for (_i = 0, _len = possiblePaths.length; _i < _len; _i++) {
      possible = possiblePaths[_i];
      if (possible !== process.execPath) {
        return possible;
      }
    }
    return path;
  };

  AutoLaunch.prototype.removeNwjsLoginItem = function() {
    return this.api.disable({
      appName: 'nwjs Helper'
    }, function() {
      return null;
    });
  };

  AutoLaunch.prototype.fixOpts = function() {
    var tempPath;
    if (/darwin/.test(process.platform)) {
      this.opts.appPath = this.fixNwExecPath(this.opts.appPath);
    }
    if (this.opts.appPath.indexOf('/') !== -1) {
      tempPath = this.opts.appPath.split('/');
      this.opts.appName = tempPath[tempPath.length - 1];
    } else if (this.opts.appPath.indexOf('\\') !== -1) {
      tempPath = this.opts.appPath.split('\\');
      this.opts.appName = tempPath[tempPath.length - 1];
      this.opts.appName = this.opts.appName.substr(0, this.opts.appName.length - '.exe'.length);
    }
    if (/darwin/.test(process.platform)) {
      if (this.opts.appName.indexOf('.app', this.opts.appName.length - '.app'.length) !== -1) {
        return this.opts.appName = this.opts.appName.substr(0, this.opts.appName.length - '.app'.length);
      }
    }
  };

  AutoLaunch.prototype.enable = function(cb) {
    if (cb == null) {
      cb = (function(_this) {
        return function() {};
      })(this);
    }
    if (this.api == null) {
      return cb(null);
    }
    this.api.enable(this.opts, cb);
    return null;
  };

  AutoLaunch.prototype.disable = function(cb) {
    if (cb == null) {
      cb = (function(_this) {
        return function() {};
      })(this);
    }
    if (this.api == null) {
      return cb(null);
    }
    this.api.disable(this.opts, cb);
    return null;
  };

  AutoLaunch.prototype.isEnabled = function(cb) {
    if (cb == null) {
      cb = (function(_this) {
        return function() {};
      })(this);
    }
    if (this.api == null) {
      return cb(false);
    }
    this.api.isEnabled(this.opts, cb);
    return null;
  };

  return AutoLaunch;

})();
