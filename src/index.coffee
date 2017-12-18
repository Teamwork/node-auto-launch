isPathAbsolute = require 'path-is-absolute'

# Public: The main auto-launch class
module.exports = class AutoLaunch

    ### Public ###

    # options - {Object}
    #   :isHidden - (Optional) {Boolean}
    #   :mac - (Optional) {Object}
    #       :useLaunchAgent - (Optional) {Boolean}. If `true`, use filed-based Launch Agent. Otherwise use AppleScript
    #           to add Login Item
    #   :name - {String}
    #   :path - (Optional) {String}
    #   :extraArgs - (Optional) {String}
    constructor: ({name, isHidden, mac, extraArgs, path}) ->
        throw new Error 'You must specify a name' unless name?

        @opts =
            appName: name
            isHiddenOnLaunch: if isHidden? then isHidden else false
            extraArgs: if extraArgs? then extraArgs else ''
            mac: mac ? {}

        versions = process?.versions
        if path?
            # Verify that the path is absolute
            throw new Error 'path must be absolute' unless isPathAbsolute path
            @opts.appPath = path

        else if versions? and (versions.nw? or versions['node-webkit']? or versions.electron?)
            @opts.appPath = process.execPath

        else
            throw new Error 'You must give a path (this is only auto-detected for NW.js and Electron apps)'

        @fixOpts()

        @api = null
        if /^win/.test process.platform
            @api = require './AutoLaunchWindows'
        else if /darwin/.test process.platform
            @api = require './AutoLaunchMac'
        else if /linux/.test process.platform
            @api = require './AutoLaunchLinux'
        else
            throw new Error 'Unsupported platform'


    enable: => @api.enable @opts


    disable: => @api.disable @opts.appName, @opts.mac


    # Returns a Promise which resolves to a {Boolean}
    isEnabled: => @api.isEnabled @opts.appName, @opts.mac


    ### Private ###


    # Corrects the path to point to the outer .app
    # path - {String}
    # macOptions - {Object}
    # Returns a {String}
    fixMacExecPath: (path, macOptions) ->
        # This will match apps whose inner app and executable's basename is the outer app's basename plus "Helper"
        # (the default Electron app structure for example)
        # It will also match apps whose outer app's basename is different to the rest but the inner app and executable's
        # basenames are matching (a typical distributed NW.js app for example)
        # Does not match when the three are different
        # Also matches when the path is pointing not to the exectuable in the inner app at all but to the Electron
        # executable in the outer app
        path = path.replace /(^.+?[^\/]+?\.app)\/Contents\/(Frameworks\/((\1|[^\/]+?) Helper)\.app\/Contents\/MacOS\/\3|MacOS\/Electron)/, '$1'
        # When using a launch agent, it needs the inner executable path
        path = path.replace /\.app\/Contents\/MacOS\/[^\/]*$/, '.app' unless macOptions.useLaunchAgent
        return path


    fixOpts: =>
        @opts.appPath = @opts.appPath.replace /\/$/, ''

        if /darwin/.test process.platform
            @opts.appPath = @fixMacExecPath(@opts.appPath, @opts.mac)

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
