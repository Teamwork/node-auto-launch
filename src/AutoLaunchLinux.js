import {untildify} from 'untildify';

const fileBasedUtilities  = require('./fileBasedUtilities');

module.exports = {

    /* Public */

    // options - {Object}
    //   :appName - {String}
    //   :appPath - {String}
    //   :isHiddenOnLaunch - {Boolean}
    // Returns a Promise
    enable({appName, appPath, isHiddenOnLaunch}) {
        const hiddenArg = isHiddenOnLaunch ? '--hidden' : '';

        const data = `[Desktop Entry]
Type=Application
Version=1.0
Name=${appName}
Comment=${appName} startup script
Exec=${appPath} ${hiddenArg}
StartupNotify=false
Terminal=false`;

        return fileBasedUtilities.createFile({
            data,
            directory: this.getDirectory(),
            filePath: this.getFilePath(appName.toLowerCase())
        });
    },


    // appName - {String}
    // Returns a Promise
    disable(appName) { return fileBasedUtilities.removeFile(this.getFilePath(appName.toLowerCase())); },


    // appName - {String}
    // Returns a Promise which resolves to a {Boolean}
    isEnabled(appName) { return fileBasedUtilities.isEnabled(this.getFilePath(appName.toLowerCase())); },


    /* Private */

    // Returns a {String}
    getDirectory() { return untildify('~/.config/autostart/'); },

    // appName - {String}
    // Returns a {String}
    getFilePath(appName) { return `${this.getDirectory()}${appName.toLowerCase()}.desktop`; }
};
