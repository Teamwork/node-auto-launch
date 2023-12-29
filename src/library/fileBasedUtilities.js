import fs from 'fs';
import { mkdirp } from 'mkdirp';

// Public: a few utils for file-based auto-launching

// This is essentially enabling auto-launching
// options - {Object}
//   :directory - {String}
//   :filePath - {String}
//   :data - {String}
// Returns a Promise
export function createFile({directory, filePath, data}) {
    return new Promise((resolve, reject) => {
        mkdirp(directory, function(mkdirErr) {
            if (mkdirErr != null) { return reject(mkdirErr); }
            return fs.writeFile(filePath, data, function(writeErr) {
                if (writeErr != null) { return reject(writeErr); }
                return resolve();
            });
        });
    });
}

// Verify auto-launch file exists or not
// filePath - {String}
// Returns a Promise
export function fileExists(filePath) {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, function(err, stat) {
            if (err != null) {
                return resolve(false);
            }
            return resolve(stat != null);
        });
    });
}

// This is essentially disabling auto-launching
// filePath - {String}
// Returns a Promise
export function removeFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, function(statErr) {
            // If it doesn't exist, this is good so resolve
            if (statErr != null) { return resolve(); }

            return fs.unlink(filePath, function(unlinkErr) {
                if (unlinkErr != null) { return reject(unlinkErr); }
                return resolve();
            });
        });
    });
}
