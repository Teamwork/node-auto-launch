chai = require 'chai'
path = require 'path'
expect = chai.expect
AutoLaunch = require '../src/'

if /^win/.test process.platform
    executablePath = path.resolve path.join './tests/executables', 'GitHubSetup.exe'
else if /darwin/.test process.platform
    executablePath = '/Applications/Calculator.app'
else # linux
    executablePath = path.resolve path.join './tests/executables', 'hv3-linux-x86'

autoLaunch = new AutoLaunch
    name: 'node-auto-launch test'
    path: executablePath


describe 'node-auto-launch', ->

    describe '.isEnabled', ->

        it 'should be disabled', (done)->

            autoLaunch.isEnabled (enabled) ->

                expect(enabled).to.equal false
                done()


    describe '.enable', ->

        it 'should enable auto launch', (done) ->

            autoLaunch.enable () ->

                autoLaunch.isEnabled (enabled) ->

                    expect(enabled).to.equal true
                    done()


    describe '.disable', ->

        it 'should disable auto launch', (done) ->

            autoLaunch.disable () ->

                autoLaunch.isEnabled (enabled) ->

                    expect(enabled).to.equal false
                    done()