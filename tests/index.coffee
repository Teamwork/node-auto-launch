chai = require 'chai'
path = require 'path'
expect = chai.expect
AutoLaunch = require '../src/'
AutoLaunchHelper = require './helper'

isMac = false

if /^win/.test process.platform
    executablePath = path.resolve path.join './tests/executables', 'GitHubSetup.exe'
else if /darwin/.test process.platform
    isMac = true
    executablePath = '/Applications/Calculator.app'
else if /linux/.test process.platform
    executablePath = path.resolve path.join './tests/executables', 'hv3-linux-x86'

console.log "Executable being used for tests:", executablePath

describe 'node-auto-launch', ->
    autoLaunch = null
    autoLaunchHelper = null


    beforeEach ->
        autoLaunch = new AutoLaunch
            name: 'node-auto-launch test'
            path: executablePath
        autoLaunchHelper = new AutoLaunchHelper(autoLaunch)


    describe '.isEnabled', ->
        beforeEach ->
            autoLaunchHelper.ensureDisabled()

        it 'should be disabled', (done) ->
            autoLaunch.isEnabled().then (enabled) ->
                expect(enabled).to.equal false
                done()
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
            autoLaunch.enable().then ->
                autoLaunch.isEnabled().then (enabled) ->
                    expect(enabled).to.equal true
                    done()
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
            autoLaunch.disable().then ->
                autoLaunch.isEnabled().then (enabled) ->
                    expect(enabled).to.equal false
                    done()
            return

        it 'should catch errors', (done) ->
            autoLaunchHelper.mockApi
                disable: ->
                    Promise.reject()

            autoLaunch.disable().catch done
            return




    # Let's test some Mac-only options
    return unless isMac

    describe 'mac.useLaunchAgent', ->
        autoLaunchWithLaunchAgent = null
        autoLaunchWithLaunchAgentHelper = null

        beforeEach ->
            autoLaunchWithLaunchAgent = new AutoLaunch
                name: 'node-auto-launch test'
                path: executablePath
                mac:
                    useLaunchAgent: true
            autoLaunchWithLaunchAgentHelper = new AutoLaunchHelper autoLaunchWithLaunchAgent

        describe '.isEnabled', ->
            beforeEach -> autoLaunchWithLaunchAgentHelper.ensureDisabled()

            it 'should be disabled', (done) ->
                autoLaunchWithLaunchAgent.isEnabled().then (enabled) ->
                    expect(enabled).to.equal false
                    done()
                return

            it 'should catch errors', (done) ->
                autoLaunchWithLaunchAgentHelper.mockApi
                    isEnabled: -> Promise.reject()

                autoLaunchWithLaunchAgent.isEnabled().catch done
                return


        describe '.enable', ->
            beforeEach -> autoLaunchWithLaunchAgentHelper.ensureDisabled()

            it 'should enable auto launch', (done) ->
                autoLaunchWithLaunchAgent.enable().then ->
                    autoLaunchWithLaunchAgent.isEnabled().then (enabled) ->
                        expect(enabled).to.equal true
                        done()
                return

            it 'should catch errors', (done) ->
                autoLaunchWithLaunchAgentHelper.mockApi
                    enable: -> Promise.reject()

                autoLaunchWithLaunchAgent.enable().catch done
                return


        describe '.disable', ->
            beforeEach -> autoLaunchWithLaunchAgentHelper.ensureEnabled()

            it 'should disable auto launch', (done) ->
                autoLaunchWithLaunchAgent.disable().then ->
                    autoLaunchWithLaunchAgent.isEnabled().then (enabled) ->
                        expect(enabled).to.equal false
                        done()
                return

            it 'should catch errors', (done) ->
                autoLaunchWithLaunchAgentHelper.mockApi
                    disable: -> Promise.reject()

                autoLaunchWithLaunchAgent.disable().catch done
                return