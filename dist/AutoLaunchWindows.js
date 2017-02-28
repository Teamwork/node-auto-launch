var Winreg, fs, path, regKey;

fs = require('fs');

path = require('path');

Winreg = require('winreg');

regKey = new Winreg({
  hive: Winreg.HKCU,
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});

module.exports = {

  /* Public */
  enable: function(arg) {
    var appName, appPath, isHiddenOnLaunch;
    appName = arg.appName, appPath = arg.appPath, isHiddenOnLaunch = arg.isHiddenOnLaunch;
    return new Promise(function(resolve, reject) {
      var args, pathToAutoLaunchedApp, ref, updateDotExe;
      pathToAutoLaunchedApp = appPath;
      args = '';
      updateDotExe = path.join(path.dirname(process.execPath), '..', 'update.exe');
      if ((((ref = process.versions) != null ? ref.electron : void 0) != null) && fs.existsSync(updateDotExe)) {
        pathToAutoLaunchedApp = updateDotExe;
        args = " --processStart \"" + (path.basename(process.execPath)) + "\"";
        if (isHiddenOnLaunch) {
          args += ' --process-start-args "--hidden"';
        }
      } else {
        if (isHiddenOnLaunch) {
          args += ' --hidden';
        }
      }
      return regKey.set(appName, Winreg.REG_SZ, "\"" + pathToAutoLaunchedApp + "\"" + args, function(err) {
        if (err != null) {
          return reject(err);
        }
        return resolve();
      });
    });
  },
  disable: function(appName) {
    return new Promise(function(resolve, reject) {
      return regKey.remove(appName, function(err) {
        if (err != null) {
          if (err.message.indexOf('The system was unable to find the specified registry key or value') !== -1) {
            return resolve(false);
          }
          return reject(err);
        }
        return resolve();
      });
    });
  },
  isEnabled: function(appName) {
    return new Promise(function(resolve, reject) {
      return regKey.get(appName, function(err, item) {
        if (err != null) {
          return resolve(false);
        }
        return resolve(item != null);
      });
    });
  }
};
