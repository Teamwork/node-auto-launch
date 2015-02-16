Winreg = require 'winreg'

regKey = new Winreg
    hive: Winreg.HKCU
    key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'

module.exports =
    # This is just for testing
    regKey: regKey

    enable: (opts, cb) ->
        regKey.set opts.appName, Winreg.REG_SZ, "\"#{opts.appPath}\"", cb


    disable: (opts, cb) ->
        regKey.remove opts.appName, cb

    isEnabled: (opts, cb) ->
        regKey.get opts.appName, (err, item) ->
            cb(item?)

