const applescript = require('applescript');
const untildify = require('untildify');
const fileBasedUtilities = require('./fileBasedUtilities');

/**
 *
 * @param {String} commandSuffix
 * @returns {Object} - a Promise
 */
const execApplescriptCommand = function execApplescriptCommand(commandSuffix) {
  return new Promise(((resolve, reject) => applescript.execString(
    `tell application "System Events" to ${commandSuffix}`,
    (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    },
  )));
};

/**
 * @returns {String}
 */
const getDirectory = function getDirectory() {
  return untildify('~/Library/LaunchAgents/');
};

/**
 * @param {String} appName
 * @returns {String}
 */
const getFilePath = function getFilePath(appName) {
  return `${getDirectory()}${appName}.plist`;
};


module.exports = class MacAutoLauncher {
  /**
   * @param {Object} options
   * @property {Object} options.meta
   */
  constructor({ meta }) {
    this.meta = meta;
  }


  /**
   * @param {String} appName
   * @param {Object} mac (Optional)
   * @property {Boolean} mac.useLaunchAgent (Optional)
   * @returns {Object} - a Promise
   */
  disable(appName, mac) {
    // Delete the file if we're using a Launch Agent
    if (mac.useLaunchAgent) {
      return fileBasedUtilities.removeFile(getFilePath(appName));
    }

    // Otherwise remove the Login Item
    return execApplescriptCommand(`delete login item "${appName}"`);
  }


  /**
   * @param {Object} options
   * @property {String} options.appName
   * @property {String} options.appPath
   * @property {Boolean} options.isHiddenOnLaunch
   * @property {Object} options.mac (Optional)
   * @property {Boolean} options.mac.useLaunchAgent (Optional)
   * @returns {Object} - a Promise
   */
  enable({
    appName,
    appPath,
    isHiddenOnLaunch,
    mac,
  }) {
    // Add the file if we're using a Launch Agent
    if (mac.useLaunchAgent) {
      const programArguments = [appPath];
      if (isHiddenOnLaunch) {
        programArguments.push('--hidden');
      }
      const programArgumentsSection = programArguments
        .map(argument => `    <string>${argument}</string>`)
        .join('\n');

      // TODO: is indentation OK?
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
        directory: getDirectory(),
        filePath: getFilePath(appName),
      });
    }

    // Otherwise, use default method; use AppleScript to tell System Events to add a Login Item

    const isHiddenValue = isHiddenOnLaunch ? 'true' : 'false';
    const properties = `{path:"${appPath}", hidden:${isHiddenValue}, name:"${appName}"}`;

    return execApplescriptCommand(`make login item at end with properties ${properties}`);
  }


  /**
   * @param {String} appName
   * @param {Object} mac (Optional)
   * @property {Boolean} mac.useLaunchAgent (Optional)
   * @returns {Object} - a Promise
   */
  isEnabled(appName, mac) {
    // Check if the Launch Agent file exists
    if (mac.useLaunchAgent) {
      return fileBasedUtilities.isEnabled(getFilePath(appName));
    }

    // Otherwise check if a Login Item exists for our app
    return execApplescriptCommand('get the name of every login item')
      .then(loginItems => (loginItems || []).includes(appName));
  }
};
