var AutoLaunch, isPathAbsolute,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

isPathAbsolute = require('path-is-absolute');

module.exports = AutoLaunch = (function() {

  /* Public */
  function AutoLaunch(arg) {
    var isHidden, mac, name, path, versions;
    name = arg.name, isHidden = arg.isHidden, mac = arg.mac, path = arg.path;
    this.fixOpts = bind(this.fixOpts, this);
    this.isEnabled = bind(this.isEnabled, this);
    this.disable = bind(this.disable, this);
    this.enable = bind(this.enable, this);
    if (name == null) {
      throw new Error('You must specify a name');
    }
    this.opts = {
      appName: name,
      isHiddenOnLaunch: isHidden != null ? isHidden : false,
      mac: mac != null ? mac : {}
    };
    versions = typeof process !== "undefined" && process !== null ? process.versions : void 0;
    if (path != null) {
      if (!isPathAbsolute(path)) {
        throw new Error('path must be absolute');
      }
      this.opts.appPath = path;
    } else if ((versions != null) && ((versions.nw != null) || (versions['node-webkit'] != null) || (versions.electron != null))) {
      this.opts.appPath = process.execPath;
    } else {
      throw new Error('You must give a path (this is only auto-detected for NW.js and Electron apps)');
    }
    this.fixOpts();
    this.api = null;
    if (/^win/.test(process.platform)) {
      this.api = require('./AutoLaunchWindows');
    } else if (/darwin/.test(process.platform)) {
      this.api = require('./AutoLaunchMac');
    } else if (/linux/.test(process.platform)) {
      this.api = require('./AutoLaunchLinux');
    } else {
      throw new Error('Unsupported platform');
    }
  }

  AutoLaunch.prototype.enable = function() {
    return this.api.enable(this.opts);
  };

  AutoLaunch.prototype.disable = function() {
    return this.api.disable(this.opts.appName, this.opts.mac);
  };

  AutoLaunch.prototype.isEnabled = function() {
    return this.api.isEnabled(this.opts.appName, this.opts.mac);
  };


  /* Private */

  AutoLaunch.prototype.fixMacExecPath = function(path) {
    return path.replace(/(^.+?[^\/]+?\.app)\/Contents\/(Frameworks\/((\1|[^\/]+?) Helper)\.app\/Contents\/MacOS\/\3|MacOS\/Electron)/, '$1');
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

  return AutoLaunch;

})();
