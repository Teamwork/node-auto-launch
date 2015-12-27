
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
        else if /linux/.test process.platform
            @api = require './AutoLaunchLinux'

    fixNwExecPath: (path) ->
        possiblePaths = [
            path.replace '/Contents/Frameworks/node-webkit Helper.app/Contents/MacOS/node-webkit Helper', ''
            path.replace '/Contents/Frameworks/nwjs Helper.app/Contents/MacOS/nwjs Helper', ''
        ]

        for possible in possiblePaths
            return possible if possible isnt process.execPath

        return path

    removeNwjsLoginItem: ->
        @api.disable {appName: 'nwjs Helper'}, ->
            return null

    fixOpts: =>
        @opts.appPath = @opts.appPath.replace /\/$/, ''

        if /darwin/.test process.platform
            @opts.appPath = @fixNwExecPath(@opts.appPath)

        if @opts.appPath.indexOf('/') isnt -1
            tempPath = @opts.appPath.split '/'
            @opts.appName = tempPath[tempPath.length - 1]
        else if @opts.appPath.indexOf('\\') isnt -1
            tempPath = @opts.appPath.split '\\'
            @opts.appName = tempPath[tempPath.length - 1]
            @opts.appName = @opts.appName.substr(0, @opts.appName.length - '.exe'.length)

        if /darwin/.test process.platform
            # Remove ".app" from the appName if it exists
            if @opts.appName.indexOf('.app', @opts.appName.length - '.app'.length) isnt -1
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
