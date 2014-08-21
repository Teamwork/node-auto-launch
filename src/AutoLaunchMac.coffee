applescript = require 'applescript'

tellTo = 'tell application "System Events" to '

module.exports =

    enable: (opts, cb) =>
        isHidden = if opts.isHiddenOnLaunch then 'false' else 'true'

        properties = "{path:\"#{opts.appPath}\", hidden:#{isHidden}, name:\"#{opts.appName}\"}"
        command = tellTo + 'make login item at end with properties ' + properties

        applescript.execString command, cb


    disable: (opts, cb) =>
        command = tellTo + "delete login item \"#{opts.appName}\""

        applescript.execString command, cb


    isEnabled: (opts, cb) =>
        command = tellTo + "get the name of every login item"

        applescript.execString command, (err, loginItems) ->
            return false unless loginItems?

            cb(loginItems.indexOf(opts.appName) > -1)