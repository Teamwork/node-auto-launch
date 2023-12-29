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
describe('node-auto-launch', function () {
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

    if (!isMac) {
        describe('.isEnabled', function () {
            beforeEach(() => {
                autoLaunchHelper.ensureDisabled();
            });

            it('should be disabled', function (done) {
                autoLaunch.isEnabled()
                    .then(function (enabled) {
                        expect(enabled).to.equal(false);
                        return done();})
                    .catch(done);
            });

            return it('should catch errors', function (done) {
                autoLaunchHelper.mockApi({
                    isEnabled() {
                        return Promise.reject();
                    }
                });

                autoLaunch.isEnabled().catch(done);
            });
        });

        describe('.enable', function () {
            beforeEach(() => {
                autoLaunchHelper.ensureDisabled();
            });

            it('should enable auto launch', function (done) {
                autoLaunch.enable()
                    .then(() => autoLaunch.isEnabled())
                    .then(function (enabled) {
                        expect(enabled).to.equal(true);
                        return done();
                    })
                    .catch(done);
            });

            return it('should catch errors', function (done) {
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
                    .then(() => autoLaunch.isEnabled())
                    .then(function (enabled) {
                        expect(enabled).to.equal(false);
                        return done();
                    })
                    .catch(done);
            });

            return it('should catch errors', function (done) {
                autoLaunchHelper.mockApi({
                    disable() {
                        return Promise.reject();
                    }
                });

                autoLaunch.disable().catch(done);
            });
        });

        if (isPosix) {
            describe('.appName', () => it('should honor name option', function (done) {
                expect(autoLaunch.opts.appName).to.equal('node-auto-launch test');
                done();
            }));

            describe('testing path name', function () {
                const executablePathLinux = path.resolve('./path with spaces/');
                const autoLaunchLinux = new AutoLaunch({
                    name: 'node-auto-launch test',
                    path: executablePathLinux
                });
                autoLaunchHelper = new AutoLaunchHelper(autoLaunchLinux);

                return it('should properly escape reserved caracters', function (done) {
                    expect(autoLaunchLinux.opts.appPath).not.to.equal(executablePathLinux);
                    done();
                });
            });
        }
    }

    // Let's test some Mac-only options
    else {
        describe('mac.useLaunchAgent', function () {
            let autoLaunchWithLaunchAgent = null;
            let autoLaunchWithLaunchAgentHelper = null;

            beforeEach(function () {
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

            describe('.isEnabled', function () {
                beforeEach(() => autoLaunchWithLaunchAgentHelper.ensureDisabled());

                it('should be disabled', function (done) {
                    autoLaunchWithLaunchAgent.isEnabled()
                        .then(function (enabled) {
                            expect(enabled).to.equal(false);
                            return done();})
                        .catch(done);
                });

                return it('should catch errors', function (done) {
                    autoLaunchWithLaunchAgentHelper.mockApi({
                        isEnabled() { return Promise.reject(); }});

                    autoLaunchWithLaunchAgent.isEnabled().catch(done);
                });
            });

            describe('.enable', function () {
                beforeEach(() => autoLaunchWithLaunchAgentHelper.ensureDisabled());

                it('should enable auto launch', function (done) {
                    autoLaunchWithLaunchAgent.enable()
                        .then(() => autoLaunchWithLaunchAgent.isEnabled().then(function (enabled) {
                            expect(enabled).to.equal(true);
                            return done();
                        }))
                        .catch(done);
                });

                return it('should catch errors', function (done) {
                    autoLaunchWithLaunchAgentHelper.mockApi({
                        enable() { return Promise.reject(); }});

                    autoLaunchWithLaunchAgent.enable().catch(done);
                });
            });

            describe('.disable', function () {
                beforeEach(() => autoLaunchWithLaunchAgentHelper.ensureEnabled());

                it('should disable auto launch', function (done) {
                    autoLaunchWithLaunchAgent.disable()
                        .then(() => autoLaunchWithLaunchAgent.isEnabled())
                        .then(function (enabled) {
                            expect(enabled).to.equal(false);
                            return done();
                        })
                        .catch(done);
                });

                return it('should catch errors', function (done) {
                    autoLaunchWithLaunchAgentHelper.mockApi({
                        disable() { return Promise.reject(); }
                    });

                    autoLaunchWithLaunchAgent.disable().catch(done);
                });
            });
        });
    }
});
