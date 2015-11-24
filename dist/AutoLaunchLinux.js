var fs, mkdirp, untildify;

fs = require('fs');

mkdirp = require('mkdirp');

untildify = require('untildify');

module.exports = {
  getDir: function(opts) {
    return untildify("~/.config/autostart/");
  },
  getFile: function(opts) {
    var file;
    file = this.getDir() + opts.appName + '.desktop';
    return file;
  },
  enable: function(opts, cb) {
    var data, file;
    file = this.getFile(opts);
    data = ['[Desktop Entry]', 'Type=Application', 'Vestion=1.0', 'Name=' + opts.appName, 'Comment=' + opts.appName + ' startup script', 'Exec=' + opts.appPath, 'StartupNotify=false', 'Terminal=false'].join('\n');
    mkdirp.sync(this.getDir());
    fs.writeFileSync(file, data);
    return cb();
  },
  disable: function(opts, cb) {
    var file;
    file = this.getFile(opts);
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    return cb();
  },
  isEnabled: function(opts, cb) {
    var file;
    file = this.getFile(opts);
    return cb(fs.existsSync(file));
  }
};
