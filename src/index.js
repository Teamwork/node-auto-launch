import pathTools from 'path';
import autoLaunchHandler from './library/autoLaunchHandler.js'

// Public: The main auto-launch class
export default class AutoLaunch {
    /* Public */

    // {Object}
    //  :name - {String}
    //  :path - (Optional) {String}
    //  :options - (Optional) {Object}
    //      :launchInBackground, - (Optional) {String}. If set, either use default --hidden arg or specified one.
    //      :mac - (Optional) {Object}
    //          :useLaunchAgent - (Optional) {Boolean}. If `true`, use filed-based Launch Agent. Otherwise use AppleScript
    //           to add Login Item
    //      :extraArgs - (Optional) {Array}
    constructor({ name, path, options }) {
        // Name is the only mandatory parameter and must neither be null nor empty
        if (!name) { throw new Error('You must specify a name'); }

        let opts = {
            appName: name,
            options: {
                launchInBackground: (options && (options.launchInBackground != null)) ? options.launchInBackground : false,
                mac: (options && (options.mac != null)) ? options.mac : {},
                extraArguments: (options && (options.extraArguments != null)) ? options.extraArgs : []
            }
        };

        const versions = typeof process !== 'undefined' && process !== null ? process.versions : undefined;
        if (path != null) {
            // Verify that the path is absolute
            if ((!pathTools.isAbsolute(path)) && !process.windowsStore) { throw new Error('path must be absolute'); }
            opts.appPath = path;
        } else if ((versions != null) && ((versions.nw != null) || (versions['node-webkit'] != null) || (versions.electron != null))) {
            // This appPath will need to be fixed later depending of the OS used
            opts.appPath = process.execPath;
        } else {
            throw new Error('You must give a path (this is only auto-detected for NW.js and Electron apps)');
        }

        opts = this.#fixOpts(opts);

        this.api = autoLaunchHandler(opts);
    }

    enable() {
        return this.api.enable();
    }

    disable() {
        return this.api.disable();
    }

    // Returns a Promise which resolves to a {Boolean}
    isEnabled() {
        return this.api.isEnabled();
    }

    /* Private */

    #fixOpts(opts) {
        const options = opts;

        if (/darwin/.test(process.platform)) {
            let name;
            const tempPath = options.appPath.split('/');

            name = tempPath[tempPath.length - 1];
            // Remove ".app" from the appName if it exists
            if (name.indexOf('.app', name.length - '.app'.length) !== -1) {
                name = name.substr(0, name.length - '.app'.length);
            }
            options.appName = name;
        }

        return options;
    }
}
