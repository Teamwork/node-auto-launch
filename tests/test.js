import { expect } from 'chai';
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
if (!isMac) {
    describe('node-auto-launch', () => {
        let autoLaunch = null;
        let autoLaunchHelper = null;

        beforeEach(() => {
            autoLaunch = new AutoLaunch({
                name: 'node-auto-launch test',
                path: executablePath
            });
            autoLaunchHelper = new AutoLaunchHelper(autoLaunch);
            return autoLaunchHelper;
        });

        describe('.isEnabled', () => {
            beforeEach(() => {
                autoLaunchHelper.ensureDisabled();
            });

            it('should be disabled', (done) => {
                autoLaunch.isEnabled()
                    .then((enabled) => {
                        expect(enabled).to.equal(false);
                        done();
                    })
                    .catch(done);
            });

            it('should catch errors', (done) => {
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

            it('should enable auto launch', (done) => {
                autoLaunch.enable()
                    .then(() => {
                        autoLaunch.isEnabled()
                            .then((enabled) => {
                                expect(enabled).to.equal(true);
                                // done();
                            });
                    })
                    // This should prevent done() from catching non-errors
                    .then(() => {
                        done();
                    })
                    .catch(done);
            });

            it('should catch errors', (done) => {
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

            it('should disable auto launch', (done) => {
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

            it('should catch errors', (done) => {
                autoLaunchHelper.mockApi({
                    disable() {
                        return Promise.reject();
                    }
                });

                autoLaunch.disable().catch(done);
            });
        });

        /* On macOS, we modify the appName (leftover from Coffeescript that had no explaination) */
        describe('.appName', () => {
            it('should honor name parameter', (done) => {
                expect(autoLaunch.api.appName).to.equal('node-auto-launch test');
                done();
            });
        });
    });
}

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
            it('should properly escape reserved caracters', (done) => {
                expect(autoLaunchPosix.api.appPath).to.equal(executablePathPosix.replace(/(\s+)/g, '\\$1'));
                done();
            });
        });
    });
}

// Let's test some Mac-only options
if (isMac) {
    describe('mac.useLaunchAgent', () => {
        let autoLaunchWithLaunchAgent = null;
        let autoLaunchWithLaunchAgentHelper = null;

        beforeEach(() => {
            autoLaunchWithLaunchAgent = new AutoLaunch({
                name: 'node-auto-launch test',
                path: executablePath,
                options: {
                    mac: {
                        useLaunchAgent: true
                    }
                }
            });
            autoLaunchWithLaunchAgentHelper = new AutoLaunchHelper(autoLaunchWithLaunchAgent);
            return autoLaunchWithLaunchAgentHelper;
        });

        describe('.isEnabled', () => {
            beforeEach(() => {
                autoLaunchWithLaunchAgentHelper.ensureDisabled();
            });

            it('should be disabled', (done) => {
                autoLaunchWithLaunchAgent.isEnabled()
                    .then((enabled) => {
                        expect(enabled).to.equal(false);
                        done();
                    })
                    .catch(done);
            });

            it('should catch errors', (done) => {
                autoLaunchWithLaunchAgentHelper.mockApi({
                    isEnabled() {
                        return Promise.reject();
                    }
                });
                autoLaunchWithLaunchAgent.isEnabled().catch(done);
            });
        });

        describe('.enable', () => {
            beforeEach(() => {
                autoLaunchWithLaunchAgentHelper.ensureDisabled();
            });

            it('should enable auto launch', (done) => {
                autoLaunchWithLaunchAgent.enable()
                    .then(() => {
                        autoLaunchWithLaunchAgent.isEnabled()
                            .then((enabled) => {
                                expect(enabled).to.equal(true);
                                done();
                            });
                    })
                    .catch(done);
            });

            it('should catch errors', (done) => {
                autoLaunchWithLaunchAgentHelper.mockApi({
                    enable() {
                        return Promise.reject();
                    }
                });

                autoLaunchWithLaunchAgent.enable().catch(done);
            });
        });

        describe('.disable', () => {
            beforeEach(() => {
                autoLaunchWithLaunchAgentHelper.ensureEnabled();
            });

            it('should disable auto launch', (done) => {
                autoLaunchWithLaunchAgent.disable()
                    .then(() => {
                        autoLaunchWithLaunchAgent.isEnabled()
                            .then((enabled) => {
                                expect(enabled).to.equal(false);
                                done();
                            });
                    })
                    .catch(done);
            });

            it('should catch errors', (done) => {
                autoLaunchWithLaunchAgentHelper.mockApi({
                    disable() {
                        return Promise.reject();
                    }
                });

                autoLaunchWithLaunchAgent.disable().catch(done);
            });
        });
    });
}
