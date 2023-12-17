/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const applescript         = require('applescript');
const untildify           = require('untildify');
const fileBasedUtilities  = require('./fileBasedUtilities');


module.exports = {

    /* Public */

    // options - {Object}
    //   :appName - {String}
    //   :appPath - {String}
    //   :isHiddenOnLaunch - {Boolean}
    //   :mac - (Optional) {Object}
    //       :useLaunchAgent - (Optional) {Boolean}
    // Returns a Promise
    enable({appName, appPath, isHiddenOnLaunch, mac}) {

        // Add the file if we're using a Launch Agent
        if (mac.useLaunchAgent) {
            const programArguments = [appPath];
            if (isHiddenOnLaunch) { programArguments.push('--hidden'); }
            const programArgumentsSection = programArguments
                .map(argument => `    <string>${argument}</string>`)
                .join('\n');

            const data = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${appName}</string>
  <key>ProgramArguments</key>
  <array>
  ${programArgumentsSection}
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>`;

            return fileBasedUtilities.createFile({
                data,
                directory: this.getDirectory(),
                filePath: this.getFilePath(appName)
            });
        }

        // Otherwise, use default method; use AppleScript to tell System Events to add a Login Item

        const isHiddenValue = isHiddenOnLaunch ? 'true' : 'false';
        const properties = `{path:\"${appPath}\", hidden:${isHiddenValue}, name:\"${appName}\"}`;

        return this.execApplescriptCommand(`make login item at end with properties ${properties}`);
    },


    // appName - {String}
    // mac - {Object}
    //   :useLaunchAgent - {Object}
    // Returns a Promise
    disable(appName, mac) {
        // Delete the file if we're using a Launch Agent
        if (mac.useLaunchAgent) { return fileBasedUtilities.removeFile(this.getFilePath(appName)); }

        // Otherwise remove the Login Item
        return this.execApplescriptCommand(`delete login item \"${appName}\"`);
    },


    // appName - {String}
    // mac - {Object}
    //   :useLaunchAgent - {Object}
    // Returns a Promise which resolves to a {Boolean}
    isEnabled(appName, mac) {
        // Check if the Launch Agent file exists
        if (mac.useLaunchAgent) { return fileBasedUtilities.isEnabled(this.getFilePath(appName)); }

        // Otherwise check if a Login Item exists for our app
        return this.execApplescriptCommand('get the name of every login item').then(loginItems => (loginItems != null) && Array.from(loginItems).includes(appName));
    },


    /* Private */


    // commandSuffix - {String}
    // Returns a Promise
    execApplescriptCommand(commandSuffix) {
        return new Promise((resolve, reject) => applescript.execString(`tell application \"System Events\" to ${commandSuffix}`, function(err, result) {
            if (err != null) { return reject(err); }
            return resolve(result);
        }));
    },


    // Returns a {String}
    getDirectory() { return untildify('~/Library/LaunchAgents/'); },


    // appName - {String}
    // Returns a {String}
    getFilePath(appName) { return `${this.getDirectory()}${appName}.plist`; }
};