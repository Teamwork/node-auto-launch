var Winreg, regKey;

Winreg = require('winreg');

regKey = new Winreg({
  hive: Winreg.HKCU,
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});

module.exports = {
  regKey: regKey,
  enable: function(opts, cb) {
    return regKey.set(opts.appName, Winreg.REG_SZ, "\"" + opts.appPath + "\"", cb);
  },
  disable: function(opts, cb) {
    return regKey.remove(opts.appName, cb);
  },
  isEnabled: function(opts, cb) {
    return regKey.get(opts.appName, function(err, item) {
      return cb(item != null);
    });
  }
};
