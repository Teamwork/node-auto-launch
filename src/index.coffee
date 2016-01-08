
# Public: REPLACE_WITH_DESCRIPTION
module.exports = class AutoLaunch

    ### Public ###

    constructor: (opts) ->

        unless opts.name?
            throw new Error 'You must specify a name'

        @opts = {}

        @opts.appName = opts.name
        @opts.isHiddenOnLaunch = if opts.isHidden? then opts.isHidden else false

        versions = process?.versions

        if opts.path?
            @opts.appPath = opts.path
        else if versions? and (versions.nw? or versions['node-webkit']? or versions.electron?)
            @opts.appPath = process.execPath
        else
            throw new Error "You must give a path (this is only auto-detected for NW.js and Electron apps)"

        @fixOpts()

        @api = null

        if /^win/.test process.platform
            @api = require './AutoLaunchWindows'
        else if /darwin/.test process.platform
            @api = require './AutoLaunchMac'
        else if /linux/.test process.platform
            @api = require './AutoLaunchLinux'

    # Corrects the path to point to the outer .app
    # path - {String}
    # Returns a {String}
    fixMacExecPath: (path) ->
        # This will match apps whose inner app and executable's basename is the outer app's basename plus "Helper"
        # (the default Electron app structure for example)
        # It will also match apps whose outer app's basename is different to the rest but the inner app and executable's
        # basenames are matching (a typical distributed NW.js app for example)
        # Does not match when the three are different
        # Also matches when the path is pointing not to the exectuable in the inner app at all but to the Electron
        # executable in the outer app
        return path.replace /(^.+?[^\/]+?\.app)\/Contents\/(Frameworks\/((\1|[^\/]+?) Helper)\.app\/Contents\/MacOS\/\3|MacOS\/Electron)/, '$1'

    removeNwjsLoginItem: ->
        @api.disable {appName: 'nwjs Helper'}, ->
            return null

    fixOpts: =>
        @opts.appPath = @opts.appPath.replace /\/$/, ''

        if /darwin/.test process.platform
            @opts.appPath = @fixMacExecPath(@opts.appPath)

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
    enable: () ->
        return Promise.reject(new Error('Platform not supported')) unless @api?
        @api.enable(@opts)

    # disable
    disable: () ->
        return Promise.reject(new Error('Platform not supported')) unless @api?
        @api.disable(@opts)

    # isEnabled
    isEnabled: () ->
        return Promise.reject(new Error('Platform not supported')) unless @api?
        @api.isEnabled(@opts)
