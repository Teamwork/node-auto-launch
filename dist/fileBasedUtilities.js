var fs, mkdirp;

fs = require('fs');

mkdirp = require('mkdirp');

module.exports = {

  /* Public */
  createFile: function(arg) {
    var data, directory, filePath;
    directory = arg.directory, filePath = arg.filePath, data = arg.data;
    return new Promise(function(resolve, reject) {
      return mkdirp(directory, function(mkdirErr) {
        if (mkdirErr != null) {
          return reject(mkdirErr);
        }
        return fs.writeFile(filePath, data, function(writeErr) {
          if (writeErr != null) {
            return reject(writeErr);
          }
          return resolve();
        });
      });
    });
  },
  isEnabled: function(filePath) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return fs.stat(filePath, function(err, stat) {
          if (err != null) {
            return resolve(false);
          }
          return resolve(stat != null);
        });
      };
    })(this));
  },
  removeFile: function(filePath) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return fs.stat(filePath, function(statErr) {
          if (statErr != null) {
            return resolve();
          }
          return fs.unlink(filePath, function(unlinkErr) {
            if (unlinkErr != null) {
              return reject(unlinkErr);
            }
            return resolve();
          });
        });
      };
    })(this));
  }
};
