
# Public: REPLACE_WITH_DESCRIPTION
module.exports = class AutoLaunch

    ### Public ###

    constructor: (opts) ->

        unless opts.name?
            throw new Error 'You must specify a name'

        @opts = {}

        @opts.appName = opts.name
        @opts.isHiddenOnLaunch = if opts.isHidden? then opts.isHidden else false
        @opts.appPath = if opts.path? then opts.path else process.execPath

        @api = null

        if /^win/.test process.platform
            @api = require './AutoLaunchWindows'
        else if /darwin/.test process.platform
            @api = require './AutoLaunchMac'

    # enable
    enable: (cb=()=>) =>
        unless @api? then return cb(null)

        @api.enable(@opts, cb)

        return null

    # disable
    disable: (cb=()=>) =>
        unless @api? then return cb(null)

        @api.disable(@opts, cb)

        return null

    # isEnabled
    isEnabled: (cb=()=>) =>
        unless @api? then return cb(false)

        @api.isEnabled(@opts, cb)

        return null