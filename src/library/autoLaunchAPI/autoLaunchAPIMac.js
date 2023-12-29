import applescript from 'applescript';
import untildify from 'untildify';
import * as fileBasedUtilities from '../fileBasedUtilities.js';
import AutoLaunchAPI from './autoLaunchAPI.js'

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
    }

    // Returns a Promise
    enable() {
        const hiddenArg = this.options.launchInBackground;
        const extraArgs = this.options.extraArguments;

        // Add the file if we're using a Launch Agent
        if (this.mac.useLaunchAgent) {
            const programArguments = this.appPath;

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
                filePath: this.#getPlistFilePath(this.appName),
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
        if (this.mac.useLaunchAgent) { return fileBasedUtilities.removeFile(this.#getPlistFilePath(this.appName)); }

        // Otherwise remove the Login Item
        return this.#execApplescriptCommand(`delete login item "${this.appName}"`);
    }

    // Returns a Promise which resolves to a {Boolean}
    isEnabled() {
        // Check if the Launch Agent file exists
        if (this.mac.useLaunchAgent) { return fileBasedUtilities.fileExists(this.#getPlistFilePath(this.appName)); }

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
            })
        });
    }

    // Returns a {String}
    #getLaunchAgentsDirectory() { return untildify(MAC_LAUNCHAGENTS_DIR); }

    // appName - {String}
    // Returns a {String}
    #getPlistFilePath(appName) { return `${this.#getLaunchAgentsDirectory()}${appName}.plist`; }
}
