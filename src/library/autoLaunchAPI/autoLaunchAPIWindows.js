import fs from 'fs';
import path from 'path';
import Winreg from 'winreg';
import AutoLaunchAPI from './autoLaunchAPI.js';

const regKey = new Winreg({
  hive: Winreg.HKCU,
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});

export default class AutoLaunchAPIWindows extends AutoLaunchAPI {
  /* Public */

  constructor(init) {
    super(init);
  }

  // Returns a Promise
  enable() {
    return new Promise((resolve, reject) => {
      let args = '';
      let pathToAutoLaunchedApp;
      const hiddenArg = this.options.launchInBackground;
      const extraArgs = this.options.extraArguments;
      const updateDotExe = path.join(path.dirname(process.execPath), '..', 'update.exe');

      // If they're using Electron and Squirrel.Windows, point to its Update.exe instead of the actual appPath
      // Otherwise, we'll auto-launch an old version after the app has updated
      if (((process.versions != null ? process.versions.electron : undefined) != null) && fs.existsSync(updateDotExe)) {
        pathToAutoLaunchedApp = `"${updateDotExe}"`;
        args = ` --processStart "${path.basename(process.execPath)}"`;

        // Manage arguments
        if (hiddenArg || extraArgs) {
          args += ' --process-start-args';
          if (hiddenArg) {
            args += ` "${(hiddenArg !== true) ? hiddenArg : '--hidden'}"`;
          }
          // Add any extra arguments
          if (extraArgs) {
            args += ' "';
            args += extraArgs.join('" "');
            args += '"';
          }
        }
      } else {
        // If this is an AppX (from Microsoft Store), the path doesn't point to a directory per se,
        // but it's made of "DEV_ID.APP_ID!PACKAGE_NAME". It's used to identify the app in the AppsFolder.
        // To launch the app, explorer.exe must be call in combination with its path relative to AppsFolder
        if (process.windowsStore) {
          pathToAutoLaunchedApp = `"explorer.exe" shell:AppsFolder\\${this.appPath}`;
        } else {
          pathToAutoLaunchedApp = `"${this.appPath}"`;
        }

        // Manage arguments
        if (hiddenArg) {
          args = [(hiddenArg !== true) ? hiddenArg : ' --hidden'];
        }
        // Add any extra arguments
        if (extraArgs) {
          args += ' ';
          args += extraArgs.join(' ');
        }
      }

      regKey.set(this.appName, Winreg.REG_SZ, `"${pathToAutoLaunchedApp}"${args}`, (err) => {
        if (err != null) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  // Returns a Promise
  disable() {
    return new Promise((resolve, reject) => {
      regKey.remove(this.appName, (err) => {
        if (err != null) {
          // The registry key should exist but, in case it fails because it doesn't exist,
          // resolve false instead of rejecting with an error
          if (err.message.indexOf('The system was unable to find the specified registry key or value') !== -1) {
            return resolve(false);
          }
          return reject(err);
        }
        return resolve();
      });
    });
  }

  // Returns a Promise which resolves to a {Boolean}
  isEnabled() {
    return new Promise((resolve) => {
      regKey.valueExists(this.appName, (err, exists) => {
        if (err != null) {
          return resolve(false);
        }
        return resolve(exists);
      });
    });
  }
}
