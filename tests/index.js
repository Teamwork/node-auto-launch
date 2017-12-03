const chai = require('chai');
const path = require('path');
const AutoLaunch = require('../src/');
const AutoLaunchHelper = require('./helper');

const { expect } = chai;

let isMac = false;

let executablePath;
if (/^win/.test(process.platform)) {
  executablePath = path.resolve(path.join('./tests/executables', 'GitHubSetup.exe'));
} else if (/darwin/.test(process.platform)) {
  isMac = true;
  executablePath = '/Applications/Calculator.app';
} else if (/linux/.test(process.platform)) {
  executablePath = path.resolve(path.join('./tests/executables', 'hv3-linux-x86'));
}

console.log('Executable being used for tests:', executablePath);

describe('node-auto-launch', () => {
  let autoLaunch;
  let autoLaunchHelper;

  beforeEach(() => {
    autoLaunch = new AutoLaunch({
      name: 'node-auto-launch test',
      path: executablePath,
    });
    autoLaunchHelper = new AutoLaunchHelper(autoLaunch);
  });


  describe('.isEnabled', () => {
    beforeEach(() => autoLaunchHelper.ensureDisabled());

    it('should be disabled', (done) => {
      autoLaunch.isEnabled().then((enabled) => {
        expect(enabled).to.equal(false);
        return done();
      }).catch(done);
    });

    it('should catch errors', (done) => {
      autoLaunchHelper.mockApi({
        isEnabled() {
          return Promise.reject();
        },
      });

      autoLaunch.isEnabled().catch(done);
    });
  });


  describe('.enable', () => {
    beforeEach(() => autoLaunchHelper.ensureDisabled());

    it('should enable auto launch', (done) => {
      autoLaunch.enable()
        .then(() => autoLaunch.isEnabled())
        .then((enabled) => {
          expect(enabled).to.equal(true);
          return done();
        }).catch(done);
    });

    it('should catch errors', (done) => {
      autoLaunchHelper.mockApi({
        enable() {
          return Promise.reject();
        },
      });

      autoLaunch.enable().catch(done);
    });
  });


  describe('.disable', () => {
    beforeEach(() => autoLaunchHelper.ensureEnabled());

    it('should disable auto launch', (done) => {
      autoLaunch.disable()
        .then(() => autoLaunch.isEnabled())
        .then((enabled) => {
          expect(enabled).to.equal(false);
          return done();
        }).catch(done);
    });

    it('should catch errors', (done) => {
      autoLaunchHelper.mockApi({
        disable() {
          return Promise.reject();
        },
      });

      autoLaunch.disable().catch(done);
    });
  });


  // Let's test some Mac-only options
  if (!isMac) {
    return;
  }

  describe('mac.useLaunchAgent', () => {
    let autoLaunchWithLaunchAgent;
    let autoLaunchWithLaunchAgentHelper;

    beforeEach(() => {
      autoLaunchWithLaunchAgent = new AutoLaunch({
        name: 'node-auto-launch test',
        path: executablePath,
        mac: {
          useLaunchAgent: true,
        },
      });
      autoLaunchWithLaunchAgentHelper = new AutoLaunchHelper(autoLaunchWithLaunchAgent);
    });

    describe('.isEnabled', () => {
      beforeEach(() => autoLaunchWithLaunchAgentHelper.ensureDisabled());

      it('should be disabled', (done) => {
        autoLaunchWithLaunchAgent.isEnabled().then((enabled) => {
          expect(enabled).to.equal(false);
          return done();
        }).catch(done);
      });

      it('should catch errors', (done) => {
        autoLaunchWithLaunchAgentHelper.mockApi({ isEnabled() { return Promise.reject(); } });

        autoLaunchWithLaunchAgent.isEnabled().catch(done);
      });
    });


    describe('.enable', () => {
      beforeEach(() => autoLaunchWithLaunchAgentHelper.ensureDisabled());

      it('should enable auto launch', (done) => {
        autoLaunchWithLaunchAgent.enable().then(() =>
          autoLaunchWithLaunchAgent.isEnabled().then((enabled) => {
            expect(enabled).to.equal(true);
            return done();
          })).catch(done);
      });

      it('should catch errors', (done) => {
        autoLaunchWithLaunchAgentHelper.mockApi({
          enable() {
            return Promise.reject();
          },
        });

        autoLaunchWithLaunchAgent.enable().catch(done);
      });
    });


    return describe('.disable', () => {
      beforeEach(() => autoLaunchWithLaunchAgentHelper.ensureEnabled());

      it('should disable auto launch', (done) => {
        autoLaunchWithLaunchAgent.disable()
          .then(() => autoLaunchWithLaunchAgent.isEnabled())
          .then((enabled) => {
            expect(enabled).to.equal(false);
            return done();
          }).catch(done);
      });

      it('should catch errors', (done) => {
        autoLaunchWithLaunchAgentHelper.mockApi({
          disable() {
            return Promise.reject();
          },
        });

        autoLaunchWithLaunchAgent.disable().catch(done);
      });
    });
  });
});
