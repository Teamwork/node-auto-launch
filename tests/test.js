import { expect, should } from 'chai';
import path from 'path';
import AutoLaunch from '../src/index.js';
import AutoLaunchHelper from './helper.js';

let executablePath = '';
let isPosix = false;
let isMac = false;

if (/^win/.test(process.platform)) {
    executablePath = path.resolve(path.join('./tests/executables', 'GitHubSetup.exe'));
} else if (/darwin/.test(process.platform)) {
    isMac = true;
    executablePath = '/Applications/Calculator.app';
} else if ((/linux/.test(process.platform)) || (/freebsd/.test(process.platform))) {
    isPosix = true;
    executablePath = path.resolve(path.join('./tests/executables', 'hv3-linux-x86'));
}

console.log('Executable being used for tests:', executablePath);

// General tests for all platforms
describe('node-auto-launch', () => {
    let autoLaunch = null;
    let autoLaunchHelper = null;

    beforeEach(() => {
        autoLaunch = new AutoLaunch({
            name: 'node-auto-launch test',
            path: executablePath,
            options: {
                mac: isMac ? { useLaunchAgent: true } : {}
            }
        });
        autoLaunchHelper = new AutoLaunchHelper(autoLaunch);
        return autoLaunchHelper;
    });

    describe('AutoLaunch constructor', () => {
        it('should fail without a name', function (done) {
            try {
                autoLaunch = new AutoLaunch({name: null});
                // Force the test to fail since error wasn't thrown
                should.fail('It should have failed...');
            } catch (error) {
                // Constructor threw Error, so test succeeded.
                done();
            }
        });

        it('should fail with an empty name', function (done) {
            try {
                autoLaunch = new AutoLaunch({name: ''});
                // Force the test to fail since error wasn't thrown
                should.fail('It should have failed...');
            } catch (error) {
                // Constructor threw Error, so test succeeded.
                done();
            }
        });
    });

    describe('.isEnabled', () => {
        beforeEach(() => {
            autoLaunchHelper.ensureDisabled();
        });

        it('should be disabled', function (done) {
            autoLaunch.isEnabled()
                .then((enabled) => {
                    expect(enabled).to.equal(false);
                    done();
                })
                .catch(done);
        });

        it('should catch errors', function (done) {
            autoLaunchHelper.mockApi({
                isEnabled() {
                    return Promise.reject();
                }
            });

            autoLaunch.isEnabled().catch(done);
        });
    });

    describe('.enable', () => {
        beforeEach(() => {
            autoLaunchHelper.ensureDisabled();
        });

        it('should enable auto launch', function (done) {
            autoLaunch.enable()
                .then(() => {
                    autoLaunch.isEnabled()
                        .then((enabled) => {
                            try {
                                expect(enabled).to.equal(true);
                            } catch (error) {
                                console.log('Oops, .isEnabled() failed? ', error);
                                return error;
                            }
                            return null;
                        })
                        .then((error) => {
                            done(error);
                        });
                })
                .catch(done);
        });

        it('should catch errors', function (done) {
            autoLaunchHelper.mockApi({
                enable() {
                    return Promise.reject();
                }
            });

            autoLaunch.enable().catch(done);
        });
    });

    describe('.disable', () => {
        beforeEach(() => {
            autoLaunchHelper.ensureEnabled();
        });

        it('should disable auto launch', function (done) {
            autoLaunch.disable()
                .then(() => {
                    autoLaunch.isEnabled()
                        .then((enabled) => {
                            expect(enabled).to.equal(false);
                            done();
                        });
                })
                .catch(done);
        });

        it('should catch errors', function (done) {
            autoLaunchHelper.mockApi({
                disable() {
                    return Promise.reject();
                }
            });

            autoLaunch.disable().catch(done);
        });
    });

    /* On macOS, we modify the appName (leftover from Coffeescript that had no explaination) */
    if (!isMac) {
        describe('.appName', () => {
            it('should honor name parameter', function (done) {
                expect(autoLaunch.api.appName).to.equal('node-auto-launch test');
                done();
            });
        });
    }
});

// Let's test some POSIX/Linux/FreeBSD options
// They rely on reading and write files on POSIX based filesystems
if (isPosix) {
    describe('POSIX/Linux/FreeBSD tests', () => {
        let autoLaunchPosix = null;
        // let autoLaunchPosixHelper = null;
        const executablePathPosix = path.resolve('./path with spaces/');

        beforeEach(() => {
            autoLaunchPosix = new AutoLaunch({
                name: 'node-auto-launch test',
                path: executablePathPosix,
                options: {
                    mac: isMac ? { useLaunchAgent: true } : {}
                }
            });
            // autoLaunchPosixHelper = new AutoLaunchHelper(autoLaunchPosix);
        });

        describe('testing path name', () => {
            it('should properly escape reserved caracters', function (done) {
                expect(autoLaunchPosix.api.appPath).to.equal(executablePathPosix.replace(/(\s+)/g, '\\$1'));
                done();
            });
        });
    });
}
