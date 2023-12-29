/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
import pathTools from 'path';

// Public: The main auto-launch class
export default class AutoLaunch {
    /* Public */

    // options - {Object}
    //   :name - {String}
    //   :isHidden - (Optional) {Boolean}
    //   :mac - (Optional) {Object}
    //       :useLaunchAgent - (Optional) {Boolean}. If `true`, use filed-based Launch Agent. Otherwise use AppleScript
    //           to add Login Item
    //   :path - (Optional) {String}
    constructor({name, isHidden, mac, path}) {
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
        this.isEnabled = this.isEnabled.bind(this);
        this.fixOpts = this.fixOpts.bind(this);
        // Name is the only mandatory parameter and must neither be null nor empty
        if (!name) { throw new Error('You must specify a name'); }

        this.opts = {
            appName: name,
            isHiddenOnLaunch: (isHidden != null) ? isHidden : false,
            mac: mac != null ? mac : {}
        };

        const versions = typeof process !== 'undefined' && process !== null ? process.versions : undefined;
        if (path != null) {
            // Verify that the path is absolute
            if ((!pathTools.isAbsolute(path)) && !process.windowsStore) { throw new Error('path must be absolute'); }
            this.opts.appPath = path;

        } else if ((versions != null) && ((versions.nw != null) || (versions['node-webkit'] != null) || (versions.electron != null))) {
            // This appPath will need to be fixed later depending of the OS used
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
        } else if ((/linux/.test(process.platform)) || (/freebsd/.test(process.platform))) {
            this.api = require('./AutoLaunchLinux');
        } else {
            throw new Error('Unsupported platform');
        }
    }


    enable() { return this.api.enable(this.opts); }


    disable() { return this.api.disable(this.opts.appName, this.opts.mac); }


    // Returns a Promise which resolves to a {Boolean}
    isEnabled() { return this.api.isEnabled(this.opts.appName, this.opts.mac); }


    /* Private */


    // Corrects the path to point to the outer .app
    // path - {String}
    // macOptions - {Object}
    // Returns a {String}
    fixMacExecPath(path, macOptions) {
        // This will match apps whose inner app and executable's basename is the outer app's basename plus "Helper"
        // (the default Electron app structure for example)
        // It will also match apps whose outer app's basename is different to the rest but the inner app and executable's
        // basenames are matching (a typical distributed NW.js app for example)
        // Does not match when the three are different
        // Also matches when the path is pointing not to the exectuable in the inner app at all but to the Electron
        // executable in the outer app
        path = path.replace(/(^.+?[^\/]+?\.app)\/Contents\/(Frameworks\/((\1|[^\/]+?) Helper)\.app\/Contents\/MacOS\/\3|MacOS\/Electron)/, '$1');
        // When using a launch agent, it needs the inner executable path
        if (!macOptions.useLaunchAgent) { path = path.replace(/\.app\/Contents\/MacOS\/[^\/]*$/, '.app'); }
        return path;
    }

    // Under Linux and FreeBSD, fix the ExecPath when packaged as AppImage and escape the spaces correctly
    // path - {String}
    // Returns a {String}
    fixLinuxExecPath(path) {
        // If this is an AppImage, the actual AppImage's file path must be used, otherwise the mount path will be used.
        // This will fail on the next launch, since AppImages are mount temporarily when executed in an everchanging mount folder.
        if (process.env.APPIMAGE != null) {
            path = process.env.APPIMAGE;
            console.log("Using real AppImage path at: %s", process.env.APPIMAGE);
        }

        // As stated in the .desktop spec, Exec key's value must be properly escaped with reserved characters.
        path = path.replace(/(\s+)/g, '\\$1');

        return path;
    }


    fixOpts() {
        let tempPath;
        this.opts.appPath = this.opts.appPath.replace(/\/$/, '');

        if (/darwin/.test(process.platform)) {
            this.opts.appPath = this.fixMacExecPath(this.opts.appPath, this.opts.mac);
        }

        if ((/linux/.test(process.platform)) || (/freebsd/.test(process.platform))) {
            this.opts.appPath = this.fixLinuxExecPath(this.opts.appPath);
        }

        // Comment: why are we fiddling with the appName while this is a mandatory  when calling the constructor.
        // Shouldn't we honor the provided name? Windows use the name as a descriptor, macOS uses
        // it for naming the .plist file and Linux/FreeBSD use it to name the .desktop file.
        if (this.opts.appPath.indexOf('\\') !== -1) {

            tempPath = this.opts.appPath.split('\\');
            this.opts.appName = tempPath[tempPath.length - 1];
            this.opts.appName = this.opts.appName.substr(0, this.opts.appName.length - '.exe'.length);
        }

        if (/darwin/.test(process.platform)) {
            tempPath = this.opts.appPath.split('/');
            this.opts.appName = tempPath[tempPath.length - 1];
            // Remove ".app" from the appName if it exists
            if (this.opts.appName.indexOf('.app', this.opts.appName.length - '.app'.length) !== -1) {
                return this.opts.appName = this.opts.appName.substr(0, this.opts.appName.length - '.app'.length);
            }
        }
    }
}
