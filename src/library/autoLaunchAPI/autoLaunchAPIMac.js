import applescript from 'applescript';
import path from 'node:path';
import untildify from 'untildify';
import * as fileBasedUtilities from '../fileBasedUtilities.js';
import AutoLaunchAPI from './autoLaunchAPI.js';

const MAC_LAUNCHAGENTS_DIR = '~/Library/LaunchAgents/';
const MAC_PLIST_DATA = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
<key>Label</key>
<string>{{APP_NAME}}</string>
<key>ProgramArguments</key>
<array>
{{PROGRAM_ARGUMENTS_SECTION}}
</array>
<key>RunAtLoad</key>
<true/>
</dict>
</plist>`;

export default class AutoLaunchAPIMac extends AutoLaunchAPI {
  /* Public */

  constructor(init) {
    super(init);
    this.appName = this.#fixAppName();
    this.appPath = this.#fixAppPath();
  }

  // Returns a Promise
  enable() {
    const hiddenArg = this.options.launchInBackground;
    const extraArgs = this.options.extraArguments;

    // Add the file if we're using a Launch Agent
    if (this.options.mac.useLaunchAgent) {
      const programArguments = [this.appPath];

      // Manage arguments
      if (hiddenArg) {
        programArguments.push((hiddenArg !== true) ? hiddenArg : '--hidden');
      }
      if (extraArgs) {
        programArguments.push(extraArgs);
      }
      const programArgumentsSection = programArguments
        .map((argument) => `    <string>${argument}</string>`)
        .join('\n');
      const plistData = MAC_PLIST_DATA.trim()
        .replace(/{{APP_NAME}}/g, this.appName)
        .replace(/{{PROGRAM_ARGUMENTS_SECTION}}/g, programArgumentsSection);

      return fileBasedUtilities.createFile({
        directory: this.#getLaunchAgentsDirectory(),
        filePath: this.#getPlistFilePath(),
        data: plistData
      });
    }

    // Otherwise, use default method; use AppleScript to tell System Events to add a Login Item

    const isHidden = hiddenArg ? 'true' : 'false';
    // TODO: Manage extra arguments
    const properties = `{path:"${this.appPath}", hidden:${isHidden}, name:"${this.appName}"}`;

    return this.#execApplescriptCommand(`make login item at end with properties ${properties}`);
  }

  // Returns a Promise
  disable() {
    // Delete the file if we're using a Launch Agent
    if (this.options.mac.useLaunchAgent) {
      return fileBasedUtilities.removeFile(this.#getPlistFilePath());
    }

    // Otherwise remove the Login Item
    return this.#execApplescriptCommand(`delete login item "${this.appName}"`);
  }

  // Returns a Promise which resolves to a {Boolean}
  isEnabled() {
    // Check if the Launch Agent file exists
    if (this.options.mac.useLaunchAgent) {
      return fileBasedUtilities.fileExists(this.#getPlistFilePath());
    }

    // Otherwise check if a Login Item exists for our app
    return this.#execApplescriptCommand('get the name of every login item')
      .then((loginItems) => (loginItems != null) && Array.from(loginItems).includes(this.appName));
  }

  /* Private */

  // commandSuffix - {String}
  // Returns a Promise
  #execApplescriptCommand(commandSuffix) {
    return new Promise((resolve, reject) => {
      applescript.execString(`tell application "System Events" to ${commandSuffix}`, (err, result) => {
        if (err != null) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  // Returns a {String}
  #getLaunchAgentsDirectory() {
    return untildify(MAC_LAUNCHAGENTS_DIR);
  }

  // Returns a {String}
  #getPlistFilePath() {
    return path.join(this.#getLaunchAgentsDirectory(), `${this.appName}.plist`);
  }

  // Corrects the path to point to the outer .app
  // Returns a {String}
  #fixAppPath() {
    let execPath = this.appPath;

    // This will match apps whose inner app and executable's basename is the outer app's basename plus "Helper"
    // (the default Electron app structure for example)
    // It will also match apps whose outer app's basename is different to the rest but the inner app and executable's
    // basenames are matching (a typical distributed NW.js app for example)
    // Does not match when the three are different
    // Also matches when the path is pointing not to the exectuable in the inner app at all but to the Electron
    // executable in the outer app
    // eslint-disable-next-line max-len
    execPath = execPath.replace(/(^.+?[^/]+?\.app)\/Contents\/(Frameworks\/((\1|[^/]+?) Helper)\.app\/Contents\/MacOS\/\3|MacOS\/Electron)/, '$1');

    // When using a launch agent, it needs the inner executable path
    if (!this.options.mac.useLaunchAgent) {
      execPath = execPath.replace(/\.app\/Contents\/MacOS\/[^/]*$/, '.app');
    }

    return execPath;
  }

  // Kept from Coffeescript, but should we honor the name given to autoLaunch or should we change it specifically for macOS?
  // No explanation, see issue 92: https://github.com/Teamwork/node-auto-launch/issues/92
  #fixAppName() {
    let fixedName;

    const tempPath = this.appPath.split('/');

    fixedName = tempPath[tempPath.length - 1];
    // Remove ".app" from the appName if it exists
    if (fixedName.indexOf('.app', fixedName.length - '.app'.length) !== -1) {
      fixedName = fixedName.substr(0, fixedName.length - '.app'.length);
    }

    return fixedName;
  }
}
