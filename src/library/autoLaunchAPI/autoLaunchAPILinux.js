import untildify from 'untildify';
import * as fileBasedUtilities from '../fileBasedUtilities.js';
import AutoLaunchAPI from './autoLaunchAPI.js'

const LINUX_AUTOSTART_DIR = '~/.config/autostart';
const LINUX_DESKTOP = `
[Desktop Entry]
Type=Application
Version=1.0
Name={{APP_NAME}}
Comment={{APP_NAME}} startup script
Exec={{APP_PATH}} {{ARGS}}
StartupNotify=false
Terminal=false
`;

export default class AutoLaunchAPILinux extends AutoLaunchAPI {
    /* Public */

    constructor(init) {
        super(init);
    }

    // Returns a Promise
    enable() {
        const hiddenArg = this.options.launchInBackground;
        const extraArgs = this.options.extraArguments;
        const programArguments = [];

        // Manage arguments
        if (hiddenArg) {
            programArguments.push((hiddenArg !== true) ? hiddenArg : '--hidden');
        }
        if (extraArgs) {
            programArguments.push(extraArgs);
        }
        const args = programArguments.join(' ');

        const desktop = LINUX_DESKTOP.trim()
            .replace(/{{APP_NAME}}/g, this.appName)
            .replace(/{{APP_PATH}}/g, this.appPath)
            .replace(/{{ARGS}}/g, args);

        return fileBasedUtilities.createFile({
            directory: this.#getAutostartDirectory(),
            filePath: this.#getDesktopFilePath(this.appName),
            data: desktop
        });
    }

    // Returns a Promise
    disable() {
        return fileBasedUtilities.removeFile(this.#getDesktopFilePath(this.appName));
    }

    // Returns a Promise which resolves to a {Boolean}
    isEnabled() {
        return fileBasedUtilities.fileExists(this.#getDesktopFilePath(this.appName));
    }

    /* Private */

    // Returns a {String}
    #getAutostartDirectory() {
        return untildify(LINUX_AUTOSTART_DIR);
    }

    // appName - {String}
    // Returns a {String}
    #getDesktopFilePath(appName) {
        return `${this.#getAutostartDirectory()}${appName}.desktop`;
    }
}
