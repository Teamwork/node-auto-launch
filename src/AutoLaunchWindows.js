/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const fs      = require('fs');
const path    = require('path');
const winreg  = require('winreg');


const regKey = new winreg({
    hive: winreg.HKCU,
    key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});


module.exports = {

    /* Public */

    // options - {Object}
    //   :appName - {String}
    //   :appPath - {String}
    //   :isHiddenOnLaunch - {Boolean}
    // Returns a Promise
    enable({appName, appPath, isHiddenOnLaunch}) {
        return new Promise(function(resolve, reject) {
            // If they're using Electron and Squirrel.Windows, point to its Update.exe instead of the actual appPath
            // Otherwise, we'll auto-launch an old version after the app has updated
            let args = '';
            let pathToAutoLaunchedApp;
            const updateDotExe = path.join(path.dirname(process.execPath), '..', 'update.exe');

            if (((process.versions != null ? process.versions.electron : undefined) != null) && fs.existsSync(updateDotExe)) {
                pathToAutoLaunchedApp = `\"${updateDotExe}\"`;
                args = ` --processStart \"${path.basename(process.execPath)}\"`;
                if (isHiddenOnLaunch) { args += ' --process-start-args "--hidden"'; }
            } else {
                // If this is an AppX (from Microsoft Store), the path doesn't point to a directory per se,
                // but it's made of "DEV_ID.APP_ID!PACKAGE_NAME". It's used to identify the app in the AppsFolder. 
                // To launch the app, explorer.exe must be call in combination with its path relative to AppsFolder
                if (process.windowsStore != null) {
                    pathToAutoLaunchedApp = `\"explorer.exe\" shell:AppsFolder\\${appPath}`;
                } else {
                    pathToAutoLaunchedApp = `\"${appPath}\"`;
                }
                if (isHiddenOnLaunch) { args = ' --hidden'; }
            }

            return regKey.set(appName, winreg.REG_SZ, `${pathToAutoLaunchedApp}${args}`, function(err) {
                if (err != null) { return reject(err); }
                return resolve();
            });
        });
    },


    // appName - {String}
    // Returns a Promise
    disable(appName) {
        return new Promise((resolve, reject) => regKey.remove(appName, function(err) {
            if (err != null) {
                // The registry key should exist but, in case it fails because it doesn't exist, 
                // resolve false instead of rejecting with an error
                if (err.message.indexOf('The system was unable to find the specified registry key or value') !== -1) {
                    return resolve(false);
                }
                return reject(err);
            }
            return resolve();
        }));
    },


    // appName - {String}
    // Returns a Promise which resolves to a {Boolean}
    isEnabled(appName) {
        return new Promise((resolve, reject) => regKey.get(appName, function(err, item) {
            if (err != null) { return resolve(false); }
            return resolve(item != null);
        }));
    }
};
