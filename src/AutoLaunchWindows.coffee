Winreg = require 'winreg'
Promise = require('es6-promise').Promise

regKey = new Winreg
    hive: Winreg.HKCU
    key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'

module.exports =
    # This is just for testing
    regKey: regKey

    enable: (opts) ->
        new Promise (resolve, reject) ->
            hiddenArg = if opts.isHiddenOnLaunch then ' --hidden' else ''
            regKey.set opts.appName, Winreg.REG_SZ, "\"#{opts.appPath}\"#{hiddenArg}", (err) ->
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
