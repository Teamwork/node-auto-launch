var AutoLaunch,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = AutoLaunch = (function() {

  /* Public */
  function AutoLaunch(opts) {
    this.isEnabled = __bind(this.isEnabled, this);
    this.disable = __bind(this.disable, this);
    this.enable = __bind(this.enable, this);
    if (opts.name == null) {
      throw new Error('You must specify a name');
    }
    this.opts = {};
    this.opts.appName = opts.name;
    this.opts.isHiddenOnLaunch = opts.isHidden != null ? opts.isHidden : false;
    this.opts.appPath = opts.path != null ? opts.path : process.execPath;
    this.api = null;
    if (/^win/.test(process.platform)) {
      this.api = require('./AutoLaunchWindows');
    } else if (/darwin/.test(process.platform)) {
      this.api = require('./AutoLaunchMac');
    }
  }

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
