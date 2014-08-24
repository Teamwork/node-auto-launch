
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

        @fixOpts()

        @api = null

        if /^win/.test process.platform
            @api = require './AutoLaunchWindows'
        else if /darwin/.test process.platform
            @api = require './AutoLaunchMac'

    fixOpts: =>
        if /darwin/.test process.platform
            @opts.appPath = @opts.appPath.replace '/Contents/Frameworks/node-webkit Helper.app/Contents/MacOS/node-webkit Helper', ''

        if @opts.appPath.indexOf('/') isnt -1
            tempPath = @opts.appPath.split '/'
            @opts.appName = tempPath[tempPath.length - 1]
        else if @opts.appPath.indexOf('\\') isnt -1
            tempPath = @opts.appPath.split '\\'
            @opts.appName = tempPath[tempPath.length - 1]
            @opts.appName = @opts.appName.substr(0, @opts.appName.length - '.exe'.length)

        if /darwin/.test process.platform
            @opts.appName = @opts.appName.substr(0, @opts.appName.length - '.app'.length)

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