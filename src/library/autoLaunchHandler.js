import AutoLaunchAPILinux from './autoLaunchAPI/autoLaunchAPILinux.js';
import AutoLaunchAPIMac from './autoLaunchAPI/autoLaunchAPIMac.js';
import AutoLaunchAPIWindows from './autoLaunchAPI/autoLaunchAPIWindows.js';

/* This allows to select the AutoLaunch implementation specific to a  */
//
// Returns a AutoLaunchAPI object

export default function autoLaunchHandler(options) {
    let api;

    if (/^win/.test(process.platform)) {
        api = new AutoLaunchAPIWindows(options);
    } else if (/darwin/.test(process.platform)) {
        api = new AutoLaunchAPIMac(options);
    } else if ((/linux/.test(process.platform)) || (/freebsd/.test(process.platform))) {
        api = new AutoLaunchAPILinux(options);
    } else {
        throw new Error('Unsupported platform');
    }

    return api;
}
