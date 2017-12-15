/**
 * Corrects the path to point to the outer .app
 * @param {String} appPath
 * @param {Object} macOptions
 * @returns {String}
 */
module.exports = function fixMacExecutablePath(appPath, macOptions) {
  // This will match apps whose inner app and executable's basename is the outer app's basename plus
  // "Helper" (the default Electron app structure for example)
  // It will also match apps whose outer app's basename is different to the rest but the inner app
  // and executable's basenames are matching (a typical distributed NW.js app for example)
  // Does not match when the three are different
  // Also matches when the path is pointing not to the exectuable in the inner app at all but
  // to the Electron executable in the outer app
  let newAppPath = appPath.replace(/(^.+?[^\/]+?\.app)\/Contents\/(Frameworks\/((\1|[^\/]+?) Helper)\.app\/Contents\/MacOS\/\3|MacOS\/Electron)/, '$1');
  // When using a launch agent, it needs the inner executable path
  if (!macOptions.useLaunchAgent) {
    newAppPath = newAppPath.replace(/\.app\/Contents\/MacOS\/[^\/]*$/, '.app');
  }
  return newAppPath;
};
