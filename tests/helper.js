/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
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
