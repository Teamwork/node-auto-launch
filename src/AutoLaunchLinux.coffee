fs = require('fs')
mkdirp = require('mkdirp')
untildify = require('untildify')
Promise = require('es6-promise').Promise

module.exports =
    getDir: (opts) ->
        untildify("~/.config/autostart/")

    getFile: (opts) ->
        file = @getDir()+opts.appName+'.desktop'
        return file

    enable: (opts) ->
        new Promise (resolve, reject) =>
            file = @getFile(opts)
            hiddenArg = if opts.isHiddenOnLaunch then ' --hidden' else ''

            data = [
                '[Desktop Entry]',
                'Type=Application',
                'Vestion=1.0',
                'Name='+opts.appName,
                'Comment=' + opts.appName + ' startup script',
                'Exec=' + opts.appPath + hiddenArg,
                'StartupNotify=false',
                'Terminal=false'
            ].join('\n')

            mkdirp.sync(@getDir())
            fs.writeFile file, data, (err) ->
                return reject(err) if err?
                resolve()

    disable: (opts) ->
        new Promise (resolve, reject) =>
            file = @getFile(opts)

            fs.stat file, (err) ->
                return reject(err) if err?
                fs.unlink file, (err2) ->
                    return reject(err2) if err?
                    resolve()

    isEnabled: (opts) ->
        new Promise (resolve, reject) =>
            file = @getFile(opts)

            fs.stat file, (err, stat) ->
                # TODO: Error handling
                resolve(stat?)
