fs = require 'fs'
path = require 'path'
Winreg = require 'winreg'

regKey = new Winreg
    hive: Winreg.HKCU
    key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'

module.exports =
    # This is just for testing
    regKey: regKey

    enable: (opts) ->
        new Promise (resolve, reject) ->
            appPath = opts.appPath
            hiddenArg = if opts.isHiddenOnLaunch then ' --hidden' else ''
            arg = ""
            updateDotExe = path.join(path.dirname(process.execPath), '..', 'update.exe')
            versions = process?.versions
            if fs.existsSync(updateDotExe) and versions.electron
                appPath = updateDotExe
                arg = " --processStart \"#{path.basename(process.execPath)}\""
                hiddenArg = if opts.isHiddenOnLaunch then ' --process-start-args "--hidden"' else ''
            regKey.set opts.appName, Winreg.REG_SZ, "\"#{appPath}\"#{arg}#{hiddenArg}", (err) ->
                return reject(err) if err?
                resolve()

    disable: (opts) ->
        new Promise (resolve, reject) ->
            regKey.remove opts.appName, (err) ->
                return reject(err) if err?
                resolve()

    isEnabled: (opts) ->
        new Promise (resolve, reject) ->
            regKey.get opts.appName, (err, item) ->
                # TODO: Error handling
                resolve(item?)
