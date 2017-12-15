/**
 * Detects which platform we're currently running on, etc.
 * @returns {Object}
 */
module.exports = function getMeta() {
  const meta = {};

  if (/darwin/.test(process.platform)) {
    meta.isMac = true;
  } else if (/^win/.test(process.platform)) {
    meta.isWindows = true;
  } else if (/linux/.test(process.platform)) {
    meta.isLinux = true;
  }

  const versions = process ? process.versions : {};
  if (versions.nw || versions['node-webkit']) {
    meta.isNw = true;
  } else if (versions.electron) {
    meta.isElectron = true;
  }

  return meta;
};
