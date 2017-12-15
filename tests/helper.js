module.exports = class AutoLaunchHelper {
  constructor(autoLaunch) {
    this.autoLaunch = autoLaunch;
  }

  ensureDisabled() {
    return this.autoLaunch.isEnabled().then((isEnabled) => {
      if (isEnabled) {
        return this.autoLaunch.disable();
      }
    });
  }

  ensureEnabled() {
    return this.autoLaunch.isEnabled().then((isEnabled) => {
      if (!isEnabled) {
        return this.autoLaunch.enable();
      }
    });
  }

  mockApi(stubs) {
    this.autoLaunch.api = stubs;
  }
};
