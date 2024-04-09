export default class AutoLaunchAPI {
  /* Public */

  // init - {Object}
  //   :appName - {String}
  //   :appPath - {String}
  //   :options - {Object}
  //      :launchInBackground - (Optional) {String} If set, either use default --hidden arg or specified one.
  //      :mac - (Optional) {Object}
  //          :useLaunchAgent - (Optional) {Boolean} If `true`, use filed-based Launch Agent. Otherwise use AppleScript
  //           to add Login Item
  //      :extraArguments - (Optional) {Array}
  constructor(init) {
    this.appName = init.appName;
    this.appPath = init.appPath;
    this.options = init.options;
  }

  // Returns a Promise
  enable() {
    throw new Error('enable() not implemented');
  }

  // Returns a Promise
  disable() {
    throw new Error('disable() not implemented');
  }

  // Returns a Promise which resolves to a {Boolean}
  isEnabled() {
    throw new Error('isEnable() not implemented');
  }
}
