pathTools = require 'path'

# Public: The main auto-launch class
module.exports = class AutoLaunch

    ### Public ###

    # options - {Object}
    #   :name - {String}
    #   :isHidden - (Optional) {Boolean}
    #   :mac - (Optional) {Object}
    #       :useLaunchAgent - (Optional) {Boolean}. If `true`, use filed-based Launch Agent. Otherwise use AppleScript
    #           to add Login Item
    #   :path - (Optional) {String}
    constructor: ({name, isHidden, mac, path}) ->
        throw new Error 'You must specify a name' unless name?

        @opts =
            appName: name
            isHiddenOnLaunch: if isHidden? then isHidden else false
            mac: mac ? {}

        versions = process?.versions
        if path?
            # Verify that the path is absolute
            throw new Error 'path must be absolute' unless (pathTools.isAbsolute path) or process.windowsStore
            @opts.appPath = path

        else if versions? and (versions.nw? or versions['node-webkit']? or versions.electron?)
            # This appPath will need to be fixed later depending of the OS used
            @opts.appPath = process.execPath

        else
            throw new Error 'You must give a path (this is only auto-detected for NW.js and Electron apps)'

        @fixOpts()

        @api = null
        if process.windowsStore
            @api = require './AutoLaunchWindowsAppx'
        else if /^win/.test process.platform
            @api = require './AutoLaunchWindows'
        else if /darwin/.test process.platform
            @api = require './AutoLaunchMac'
        else if (/linux/.test process.platform) or (/freebsd/.test process.platform)
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

    # Under Linux and FreeBSD, fix the ExecPath when packaged as AppImage and escape the spaces correctly
    # path - {String}
    # Returns a {String}
    fixLinuxExecPath: (path) ->
        # If this is an AppImage, the actual AppImage's file path must be used, otherwise the mount path will be used.
        # This will fail on the next launch, since AppImages are mount temporarily when executed in an everchanging mount folder.
        if process.env.APPIMAGE?
            path = process.env.APPIMAGE

        # As stated in the .desktop spec, Exec key's value must be properly escaped with reserved characters.
        path = path.replace(/(\s+)/g, '\\$1')

        return path


    fixOpts: =>
        @opts.appPath = @opts.appPath.replace /\/$/, ''

        if /darwin/.test process.platform
            @opts.appPath = @fixMacExecPath(@opts.appPath, @opts.mac)

        if (/linux/.test process.platform) or (/freebsd/.test process.platform)
            @opts.appPath = @fixLinuxExecPath(@opts.appPath)

        # Comment: why are we fiddling with the appName while this is a mandatory  when calling the constructor.
        # Shouldn't we honor the provided name? Windows use the name as a descriptor, macOS uses
        # it for naming the .plist file and Linux/FreeBSD use it to name the .desktop file.
        if @opts.appPath.indexOf('\\') isnt -1

            tempPath = @opts.appPath.split '\\'
            @opts.appName = tempPath[tempPath.length - 1]
            @opts.appName = @opts.appName.substr(0, @opts.appName.length - '.exe'.length)

        if /darwin/.test process.platform
            tempPath = @opts.appPath.split '/'
            @opts.appName = tempPath[tempPath.length - 1]
            # Remove ".app" from the appName if it exists
            if @opts.appName.indexOf('.app', @opts.appName.length - '.app'.length) isnt -1
                @opts.appName = @opts.appName.substr(0, @opts.appName.length - '.app'.length)