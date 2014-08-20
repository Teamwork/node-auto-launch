var Winreg;

Winreg = require('winreg');

this.regKey = new Winreg({
  hive: Winreg.HKCU,
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});

module.exports = {
  enable: function(opts, cb) {
    return this.regKey.set(opts.appName, Winreg.REG_SZ, opts.appPath, cb);
  },
  disable: function(opts, cb) {
    return this.regKey.remove(opts.appName, cb);
  },
  isEnabled: function(opts, cb) {
    return this.regKey.get(opts.appName, function(err, item) {
      return cb(item == null);
    });
  }
};
