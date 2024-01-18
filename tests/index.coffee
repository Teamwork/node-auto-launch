chai = require 'chai'
fs = require 'fs'
path = require 'path'
untildify = require 'untildify'
expect = chai.expect
AutoLaunch = require '../src/'
AutoLaunchHelper = require './helper'

isMac = false
followsXDG = false

if /^win/.test process.platform
    executablePath = path.resolve path.join './tests/executables', 'GitHubSetup.exe'
else if /darwin/.test process.platform
    isMac = true
    executablePath = '/Applications/Calculator.app'
else if (/linux/.test process.platform) or (/freebsd/.test process.platform)
    followsXDG = true
    executablePath = path.resolve path.join './tests/executables', 'hv3-linux-x86'

console.log "Executable being used for tests:", executablePath

# General tests for all platforms
describe 'node-auto-launch', ->
    autoLaunch = null
    autoLaunchHelper = null

    beforeEach ->
        autoLaunch = new AutoLaunch
            name: 'node-auto-launch test'
            path: executablePath
            mac:
                useLaunchAgent: if isMac then true
        autoLaunchHelper = new AutoLaunchHelper(autoLaunch)

    describe '.isEnabled', ->
        beforeEach ->
            autoLaunchHelper.ensureDisabled()

        it 'should be disabled', (done) ->
            autoLaunch.isEnabled().then (enabled) ->
                expect(enabled).to.equal false
                done()
            .catch done
            return

        it 'should catch errors', (done) ->
            autoLaunchHelper.mockApi
                isEnabled: ->
                    Promise.reject()

            autoLaunch.isEnabled().catch done
            return

    describe '.enable', ->
        beforeEach ->
            autoLaunchHelper.ensureDisabled()

        it 'should enable auto launch', (done) ->
            autoLaunch.enable()
            .then () ->
                autoLaunch.isEnabled()
            .then (enabled) ->
                expect(enabled).to.equal true
                done()
            .catch done
            return

        it 'should catch errors', (done) ->
            autoLaunchHelper.mockApi
                enable: -> Promise.reject()

            autoLaunch.enable().catch done
            return

    describe '.disable', ->
        beforeEach ->
            autoLaunchHelper.ensureEnabled()

        it 'should disable auto launch', (done) ->
            autoLaunch.disable()
            .then -> autoLaunch.isEnabled()
            .then (enabled) ->
                expect(enabled).to.equal false
                done()
            .catch done
            return

        it 'should catch errors', (done) ->
            autoLaunchHelper.mockApi
                disable: ->
                    Promise.reject()

            autoLaunch.disable().catch done
            return

    return unless followsXDG

    describe 'testing .appName', ->
        beforeEach ->
            autoLaunchLinux = null
            autoLaunchHelper = null

        it 'without space', (done) ->
            autoLaunchLinux = new AutoLaunch
                name: 'node-auto-launch'
                path: executablePath
            autoLaunchHelper = new AutoLaunchHelper(autoLaunchLinux)

            autoLaunchLinux.enable()
            .then () ->
                desktopEntryPath = untildify(path.join('~/.config/autostart/', autoLaunchLinux.opts.appName + '.desktop'))
                fs.stat desktopEntryPath, (err, stats) =>
                    if err
                        done err
                    expect(stats.isFile()).to.equal true
                    done()
            .catch done
            return

        it 'with space', (done) ->
            autoLaunchLinux = new AutoLaunch
                name: 'node-auto-launch test'
                path: executablePath
            autoLaunchHelper = new AutoLaunchHelper(autoLaunchLinux)

            autoLaunchLinux.enable()
            .then () ->
                desktopEntryPath = untildify(path.join('~/.config/autostart/', autoLaunchLinux.opts.appName + '.desktop'))
                fs.stat desktopEntryPath, (err, stats) =>
                    if err
                        done err
                    expect(stats.isFile()).to.equal true
                    done()
            .catch done
            return

        it 'with capital letters', (done) ->
            autoLaunchLinux = new AutoLaunch
                name: 'Node-Auto-Launch'
                path: executablePath
            autoLaunchHelper = new AutoLaunchHelper(autoLaunchLinux)

            autoLaunchLinux.enable()
            .then () ->
                desktopEntryPath = untildify(path.join('~/.config/autostart/', autoLaunchLinux.opts.appName + '.desktop'))
                fs.stat desktopEntryPath, (err, stats) =>
                    if err
                        done err
                    expect(stats.isFile()).to.equal true
                    done()
            .catch done
            return

        afterEach ->
            autoLaunchHelper.ensureDisabled()

    describe 'testing path name', ->
        executablePathLinux = path.resolve './path with spaces/'
        autoLaunchLinux = new AutoLaunch
            name: 'node-auto-launch test'
            path: executablePathLinux
        autoLaunchHelper = new AutoLaunchHelper(autoLaunchLinux)

        it 'should properly escape reserved caracters', (done) ->
            expect(autoLaunchLinux.opts.appPath).not.to.equal executablePathLinux
            done()
            return

    return
