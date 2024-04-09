import { expect, should } from 'chai';
import fs from 'fs';
import path from 'path';
import untildify from 'untildify';
import AutoLaunch from '../src/index.js';
import AutoLaunchHelper from './helper.js';

let executablePath = '';
let followsXDG = false;
let isPOSIX = false;
let isMac = false;

if (/^win/.test(process.platform)) {
  executablePath = path.resolve(
    path.join('./tests/executables', 'GitHubSetup.exe')
  );
} else if (/darwin/.test(process.platform)) {
  isMac = true;
  executablePath = '/Applications/Calculator.app';
} else if (/linux/.test(process.platform) || /freebsd/.test(process.platform)) {
  followsXDG = true;
  isPOSIX = true;
  executablePath = path.resolve(
    path.join('./tests/executables', 'hv3-linux-x86')
  );
}

// General tests for all platforms
describe('node-auto-launch', () => {
  let autoLaunch = null;
  let autoLaunchHelper = null;

  beforeEach(() => {
    autoLaunch = new AutoLaunch({
      name: 'node-auto-launch test',
      path: executablePath,
      options: {
        mac: isMac ? { useLaunchAgent: true } : {},
      },
    });
    autoLaunchHelper = new AutoLaunchHelper(autoLaunch);
  });

  describe('AutoLaunch constructor', () => {
    it('should fail without a name', (done) => {
      try {
        autoLaunch = new AutoLaunch({ name: null });
        // Force the test to fail since error wasn't thrown
        should.fail('It should have failed...');
      } catch (error) {
        // Constructor threw Error, so test succeeded.
        done();
      }
    });

    it('should fail with an empty name', (done) => {
      try {
        autoLaunch = new AutoLaunch({ name: '' });
        // Force the test to fail since error wasn't thrown
        should.fail('It should have failed...');
      } catch (error) {
        // Constructor threw Error, so test succeeded.
        done();
      }
    });
  });

  describe('.isEnabled', () => {
    before(() => {
      autoLaunchHelper.ensureDisabled();
    });

    it('should be disabled', (done) => {
      autoLaunch
        .isEnabled()
        .then((enabled) => {
          expect(enabled).to.equal(false);
          done();
        })
        .catch(done);
    });

    after(() => {
      autoLaunchHelper.ensureDisabled();
    });
  });

  describe('.enable', () => {
    before(() => {
      autoLaunchHelper.ensureDisabled();
    });

    it('should enable auto launch', (done) => {
      autoLaunch.enable().then(() => {
        autoLaunch
          .isEnabled()
          .then((enabled) => {
            expect(enabled).to.equal(true);
            done();
          })
          .catch(done);
      });
    });

    after(() => {
      autoLaunchHelper.ensureDisabled();
    });
  });

  describe('.disable', () => {
    beforeEach(() => {
      autoLaunchHelper.ensureEnabled();
    });

    it('should disable auto launch', (done) => {
      autoLaunch.disable().then(() => {
        autoLaunch
          .isEnabled()
          .then((enabled) => {
            expect(enabled).to.equal(false);
            done();
          })
          .catch(done);
      });
    });

    afterEach(() => {
      autoLaunchHelper.ensureDisabled();
    });
  });

  describe("Let's catch errors", () => {
    it('should catch isEnable() errors', (done) => {
      autoLaunchHelper.mockApi({
        isEnabled() {
          return Promise.reject();
        },
      });

      autoLaunch.isEnabled().catch(done);
    });

    it('should catch enable() errors', (done) => {
      autoLaunchHelper.mockApi({
        enable() {
          return Promise.reject();
        },
      });
      autoLaunch.enable().catch(done);
    });

    it('should catch disable() errors', (done) => {
      autoLaunchHelper.ensureEnabled();

      autoLaunchHelper.mockApi({
        disable() {
          return Promise.reject();
        },
      });
      autoLaunch.disable().catch(done);
    });
  });

  /* On macOS, we modify the appName (leftover from Coffeescript that had no explaination) */
  // See issue 92: https://github.com/Teamwork/node-auto-launch/issues/92
  if (!isMac) {
    describe('.appName', () => {
      it('should honor name parameter', (done) => {
        expect(autoLaunch.api.appName).to.equal('node-auto-launch test');
        done();
      });
    });
  }
});

// Let's test some POSIX/Linux/FreeBSD options
// They rely on reading and write files on POSIX based filesystems and
if (isPOSIX) {
  describe('POSIX/Linux/FreeBSD tests', () => {
    let autoLaunch = null;
    let autoLaunchHelper = null;
    const executablePathPosix = path.resolve('./path with spaces/');

    // OSes/window managers that follow XDG (cross desktop group) specifications
    if (followsXDG) {
      describe('testing .appName', () => {
        beforeEach(() => {
          autoLaunch = null;
          autoLaunchHelper = null;
        });

        it('without space', (done) => {
          autoLaunch = new AutoLaunch({
            name: 'node-auto-launch',
            path: executablePathPosix,
          });
          autoLaunchHelper = new AutoLaunchHelper(autoLaunch);
          autoLaunchHelper.ensureDisabled();

          autoLaunch
            .enable()
            .then(() => {
              const desktopEntryPath = untildify(
                path.join(
                  '~/.config/autostart/',
                  `${autoLaunch.api.appName}.desktop`
                )
              );
              fs.stat(desktopEntryPath, (err, stats) => {
                if (err) {
                  done(err);
                }
                expect(stats.isFile()).to.equal(true);
                done();
              });
            })
            .catch(done);
        });

        it('with space', (done) => {
          autoLaunch = new AutoLaunch({
            name: 'node-auto-launch test',
            path: executablePathPosix,
          });
          autoLaunchHelper = new AutoLaunchHelper(autoLaunch);
          autoLaunchHelper.ensureDisabled();

          autoLaunch
            .enable()
            .then(() => {
              const desktopEntryPath = untildify(
                path.join(
                  '~/.config/autostart/',
                  `${autoLaunch.api.appName}.desktop`
                )
              );
              fs.stat(desktopEntryPath, (err, stats) => {
                if (err) {
                  done(err);
                }
                expect(stats.isFile()).to.equal(true);
                done();
              });
            })
            .catch(done);
        });

        it('with capital letters', (done) => {
          autoLaunch = new AutoLaunch({
            name: 'Node-Auto-Launch',
            path: executablePathPosix,
          });
          autoLaunchHelper = new AutoLaunchHelper(autoLaunch);
          autoLaunchHelper.ensureDisabled();

          autoLaunch
            .enable()
            .then(() => {
              const desktopEntryPath = untildify(
                path.join(
                  '~/.config/autostart/',
                  `${autoLaunch.api.appName}.desktop`
                )
              );
              fs.stat(desktopEntryPath, (err, stats) => {
                if (err) {
                  done(err);
                }
                expect(stats.isFile()).to.equal(true);
                done();
              });
            })
            .catch(done);
        });

        afterEach(() => {
          autoLaunchHelper.ensureDisabled();
        });
      });
    }

    describe('testing path name', () => {
      beforeEach(() => {
        autoLaunch = null;
        autoLaunchHelper = null;
      });

      it('should properly escape reserved caracters', (done) => {
        autoLaunch = new AutoLaunch({
          name: 'node-auto-launch test',
          path: executablePathPosix,
        });
        autoLaunchHelper = new AutoLaunchHelper(autoLaunch);

        expect(autoLaunch.api.appPath).to.equal(
          executablePathPosix.replace(/(\s+)/g, '\\$1')
        );
        done();
      });

      afterEach(() => {
        autoLaunchHelper.ensureDisabled();
      });
    });
  });
}
