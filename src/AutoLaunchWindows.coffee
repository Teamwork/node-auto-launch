Winreg = require 'winreg'

regKey = new Winreg
    hive: Winreg.HKCU
    key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'

module.exports =
    # This is just for testing
    regKey: regKey

    enable: (opts) ->
        new Promise (resolve, reject) ->
            regKey.set opts.appName, Winreg.REG_SZ, "\"#{opts.appPath}\"", (err) ->
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
                resolve(item?)
