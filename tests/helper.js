export default class AutoLaunchHelper {
  constructor(autoLaunch) {
    this.autoLaunch = autoLaunch;
  }

  ensureEnabled() {
    return this.autoLaunch.isEnabled().then((enabled) => {
      if (!enabled) {
        return this.autoLaunch.enable();
      }
      return enabled;
    });
  }

  ensureDisabled() {
    return this.autoLaunch.isEnabled().then((enabled) => {
      if (enabled) {
        return this.autoLaunch.disable();
      }
      return enabled;
    });
  }

  mockApi(stub) {
    this.autoLaunch.api = stub;
  }
}
