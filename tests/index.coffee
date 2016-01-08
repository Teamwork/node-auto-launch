chai = require 'chai'
path = require 'path'
expect = chai.expect
AutoLaunch = require '../src/'
AutoLaunchHelper = require './helper'

if /^win/.test process.platform
    executablePath = path.resolve path.join './tests/executables', 'GitHubSetup.exe'
else if /darwin/.test process.platform
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

        it 'should catch errors', (done) ->
            autoLaunchHelper.mockApi
                isEnabled: ->
                    Promise.reject()

            autoLaunch.isEnabled().catch done

        it 'should throw an error if platform is not supported', (done) ->
            autoLaunchHelper.mockApi null

            autoLaunch.isEnabled().catch (error) ->
                expect(error).to.be.an.instanceof(Error)
                done()

    describe '.enable', ->
        beforeEach ->
            autoLaunchHelper.ensureDisabled()

        it 'should enable auto launch', (done) ->
            autoLaunch.enable().then ->
                autoLaunch.isEnabled().then (enabled) ->
                    expect(enabled).to.equal true
                    done()

        it 'should catch errors', (done) ->
            autoLaunchHelper.mockApi
                enable: ->
                    Promise.reject()

            autoLaunch.enable().catch done

        it 'should throw an error if platform is not supported', (done) ->
            autoLaunchHelper.mockApi null

            autoLaunch.isEnabled().catch (error) ->
                expect(error).to.be.an.instanceof(Error)
                done()

    describe '.disable', ->
        beforeEach ->
            autoLaunchHelper.ensureEnabled()

        it 'should disable auto launch', (done) ->
            autoLaunch.disable().then ->
                autoLaunch.isEnabled().then (enabled) ->
                    expect(enabled).to.equal false
                    done()

        it 'should catch errors', (done) ->
            autoLaunchHelper.mockApi
                disable: ->
                    Promise.reject()

            autoLaunch.disable().catch done

        it 'should throw an error if platform is not supported', (done) ->
            autoLaunchHelper.mockApi null

            autoLaunch.isEnabled().catch (error) ->
                expect(error).to.be.an.instanceof(Error)
                done()
