chai = require 'chai'
expect = chai.expect
AutoLaunch = require '../src/'

autoLaunch = new AutoLaunch
    name: 'node-auto-launch test'
    path: '/a/fake/path'


describe 'node-auto-launch', ->

    describe '.isEnabled', ->

        it 'should be disabled', (done)->
            done()
            autoLaunch.isEnabled (enabled) ->

                expect(enabled).to.equal false

                describe '.enabled', ->

                    it 'should enable auto launch', ->

                        autoLaunch.enable () ->

                            autoLaunch.isEnabled (enabled) ->

                                expect(enabled).to.equal true

                                describe '.disabled', ->

                                    it 'should disable auto launch', ->

                                        autoLaunch.disable () ->

                                            autoLaunch.isEnabled (enabled) ->

                                                expect(enabled).to.equal false



