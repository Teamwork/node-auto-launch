fs      = require 'fs'
path    = require 'path'
Winreg  = require 'winreg'


regKey = new Winreg
    hive: Winreg.HKCU
    key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'


module.exports =

    ### Public ###

    # options - {Object}
    #   :appName - {String}
    #   :appPath - {String}
    #   :isHiddenOnLaunch - {Boolean}
    #   :extraArgs - {Sting}
    # Returns a Promise
    enable: ({appName, appPath, isHiddenOnLaunch, extraArgs}) ->
        return new Promise (resolve, reject) ->
            pathToAutoLaunchedApp = appPath
            args = ''
            process_args = ''
            process_args += ' --hidden' if isHiddenOnLaunch
            process_args += (' ' + extraArgs) if extraArgs?
            updateDotExe = path.join(path.dirname(process.execPath), '..', 'update.exe')

            # If they're using Electron and Squirrel.Windows, point to its Update.exe instead
            # Otherwise, we'll auto-launch an old version after the app has updated

            if process.versions?.electron? and fs.existsSync updateDotExe
                pathToAutoLaunchedApp = updateDotExe
                args = " --processStart \"#{path.basename(process.execPath)}\""
                args += ' --process-start-args "' + process_args + '"' if isHiddenOnLaunch
            else
                args += process_args

            regKey.set appName, Winreg.REG_SZ, "\"#{pathToAutoLaunchedApp}\"#{args}", (err) ->
                return reject(err) if err?
                resolve()

    # appName - {String}
    # Returns a Promise
    disable: (appName) ->
        return new Promise (resolve, reject) ->
            regKey.remove appName, (err) ->
                if err?
                    # The registry key should exist but in case it fails because it doesn't exist, resolve false instead
                    # rejecting with an error
                    if err.message.indexOf('The system was unable to find the specified registry key or value') isnt -1
                        return resolve false
                    return reject err
                resolve()


    # appName - {String}
    # Returns a Promise which resolves to a {Boolean}
    isEnabled: (appName) ->
        return new Promise (resolve, reject) ->
            regKey.get appName, (err, item) ->
                return resolve false if err?
                resolve(item?)
