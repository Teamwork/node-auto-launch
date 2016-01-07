var AutoLaunch,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = AutoLaunch = (function() {

  /* Public */
  function AutoLaunch(opts) {
    this.isEnabled = __bind(this.isEnabled, this);
    this.disable = __bind(this.disable, this);
    this.enable = __bind(this.enable, this);
    this.fixOpts = __bind(this.fixOpts, this);
    var versions;
    if (opts.name == null) {
      throw new Error('You must specify a name');
    }
    this.opts = {};
    this.opts.appName = opts.name;
    this.opts.isHiddenOnLaunch = opts.isHidden != null ? opts.isHidden : false;
    versions = typeof process !== "undefined" && process !== null ? process.versions : void 0;
    if (opts.path != null) {
      this.opts.appPath = opts.path;
    } else if ((versions != null) && ((versions.nw != null) || (versions['node-webkit'] != null) || (versions.electron != null))) {
      this.opts.appPath = process.execPath;
    } else {
      throw new Error("You must give a path (this is only auto-detected for NW.js and Electron apps)");
    }
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

  AutoLaunch.prototype.fixMacExecPath = function(path) {
    return path.replace(/(^.+?[^\/]+?\.app)\/Contents\/(Frameworks\/((\1|[^\/]+?) Helper)\.app\/Contents\/MacOS\/\3|MacOS\/Electron)/, '$1');
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
    this.opts.appPath = this.opts.appPath.replace(/\/$/, '');
    if (/darwin/.test(process.platform)) {
      this.opts.appPath = this.fixMacExecPath(this.opts.appPath);
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
