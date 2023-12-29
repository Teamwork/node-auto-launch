let AutoLaunchHelper;
module.exports = (AutoLaunchHelper = class AutoLaunchHelper {
    constructor(autoLaunch) {
        this.autoLaunch = autoLaunch;
    }

    ensureEnabled() {
        return this.autoLaunch.isEnabled().then(enabled => {
            if (!enabled) { return this.autoLaunch.enable(); }
        });
    }

    ensureDisabled() {
        return this.autoLaunch.isEnabled().then(enabled => {
            if (enabled) { return this.autoLaunch.disable(); }
        });
    }

    mockApi(stubs) {
        return this.autoLaunch.api = stubs;
    }
});
