import AutoLaunchAPILinux from './autoLaunchAPI/autoLaunchAPILinux.js';
import AutoLaunchAPIMac from './autoLaunchAPI/autoLaunchAPIMac.js';
import AutoLaunchAPIWindows from './autoLaunchAPI/autoLaunchAPIWindows.js';

/* This allows to select the AutoLaunch implementation specific to a  */
//
// Returns a AutoLaunchAPI object

export default function autoLaunchHandler(options) {
  if (/^win/.test(process.platform)) {
    return new AutoLaunchAPIWindows(options);
  }
  if (/darwin/.test(process.platform)) {
    return new AutoLaunchAPIMac(options);
  }
  if ((/linux/.test(process.platform)) || (/freebsd/.test(process.platform))) {
    return new AutoLaunchAPILinux(options);
  }

  throw new Error('Unsupported platform');
}
