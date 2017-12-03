const isPathAbsolute = require('path-is-absolute');
const path = require('path');
const LinuxAutoLauncher = require('./LinuxAutoLauncher');
const MacAutoLauncher = require('./MacAutoLauncher');
const WindowsAutoLauncher = require('./WindowsAutoLauncher');
const fixMacExecutablePath = require('./fixMacExecutablePath');
const getMeta = require('./getMeta');

/**
 * @param {Object} meta
 * @returns {Object}
 */
const getApi = function getApi(meta) {
  if (meta.isLinux) {
    return new LinuxAutoLauncher({ meta });
  }
  if (meta.isMac) {
    return new MacAutoLauncher({ meta });
  }
  if (meta.isWindows) {
    return new WindowsAutoLauncher({ meta });
  }
  throw new Error('Unsupported platform');
};

/**
 * @param {Object} opts
 * @property {String} opts.appPath
 * @property {Object} opts.meta
 * @returns {String}
 */
const getAppName = function getAppName({ appPath, meta }) {
  const pieces = appPath.split(path.sep);
  let appName = pieces[pieces.length - 1];

  // Remove extension
  if (meta.isMac) {
    appName = appName.replace(/\.app$/, '');
  } else if (meta.isWindows) {
    appName = appName.replace(/\.exe$/, '');
  }

  return appName;
};

/**
 * @param {Object} opts
 * @property {String} opts.appPath
 * @property {Object} opts.macOptions
 * @property {Object} opts.meta
 * @returns {String}
 */
const getPath = function getPath({ appPath, macOptions, meta }) {
  let result;
  if (appPath) {
    // Verify that the path is absolute
    if (!isPathAbsolute(appPath)) {
      throw new Error('path must be absolute');
    }
    result = appPath;
  } else if (this.meta.isNw || this.meta.isElectron) {
    result = process.execPath;
  } else {
    throw new Error('You must give a path (this is only auto-detected for NW.js and Electron apps)');
  }

  if (meta.isMac) {
    result = fixMacExecutablePath(result, macOptions);
  }

  return result.replace(/\/$/, '');
};


module.exports = class AutoLaunch {
  /**
   * @param {Object} opts
   * @property {Boolean} opts.isHidden (Optional)
   * @property {Object} opts.mac (Optional)
   * @property {Boolean} opts.mac.useLaunchAgent (Optional) - If true, use filed-based Launch Agent.
   *    Otherwise use AppleScript to add Login Item
   * @property {String} opts.name TODO: this isn't used!
   * @property {String} opts.path (Optional)
   * @returns {Object}
   */
  constructor(opts) {
    this.disable = this.disable.bind(this);
    this.enable = this.enable.bind(this);
    this.isEnabled = this.isEnabled.bind(this);

    if (!opts.name) {
      throw new Error('You must specify a name');
    }

    this.meta = getMeta();
    this.opts = {
      isHiddenOnLaunch: opts.isHidden,
      mac: opts.mac || {},
    };
    this.opts.appPath = getPath({ appPath: opts.path, macOptions: this.opts.mac, meta: this.meta });
    this.opts.appName = getAppName({ appPath: this.opts.appPath, meta: this.meta });

    this.api = getApi(this.meta);
  }


  /**
   * @returns {Object} - a Promise
   */
  disable() {
    return this.api.disable(this.opts.appName, this.opts.mac);
  }


  /**
   * @returns {Object} - a Promise
   */
  enable() {
    return this.api.enable(this.opts);
  }

  /**
   * @returns {Object} - a Promise which resolves to a Boolean
   */
  isEnabled() {
    return this.api.isEnabled(this.opts.appName, this.opts.mac);
  }
};
