/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const mkdirp = require('mkdirp');

// Public: a few utils for file-based auto-launching
module.exports = {

  /* Public */

  /**
   * This is essentially enabling auto-launching
   * @param {Object} options
   * @property {String} options.directory
   * @property {String} options.filePath
   * @property {String} options.data
   * @returns {Object} - a Promise
   */
  createFile({ directory, filePath, data }) {
    return new Promise(((resolve, reject) => mkdirp(directory, (mkdirErr) => {
      if (mkdirErr != null) {
        return reject(mkdirErr);
      }
      return fs.writeFile(filePath, data, (writeErr) => {
        if (writeErr != null) {
          return reject(writeErr);
        }
        return resolve();
      });
    })));
  },


  /**
   * @param {String} filePath
   * @returns {Object} - a Promise
   */
  isEnabled(filePath) {
    return new Promise((resolve, reject) => fs.stat(
      filePath,
      (err, stat) => {
        if (err != null) {
          return resolve(false);
        }
        return resolve(stat != null);
      },
    ));
  },


  /**
   * This is essentially disabling auto-launching
   * @param {String} filePath
   * @returns {Object} - a Promise
   */
  removeFile(filePath) {
    return new Promise((resolve, reject) => fs.stat(
      filePath,
      (statErr) => {
        // If it doesn't exist, this is good so resolve
        if (statErr != null) {
          return resolve();
        }

        return fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr != null) {
            return reject(unlinkErr);
          }
          return resolve();
        });
      },
    ));
  },
};
