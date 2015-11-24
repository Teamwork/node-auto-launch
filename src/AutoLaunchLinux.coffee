fs = require('fs')
mkdirp = require('mkdirp')
untildify = require('untildify')

module.exports =
    getDir: (opts) ->
        untildify("~/.config/autostart/")

    getFile: (opts) ->
        file = @getDir()+opts.appName+'.desktop'
        return file

    enable: (opts, cb) ->
        file = @getFile(opts)

        data = [
          '[Desktop Entry]',
          'Type=Application',
          'Vestion=1.0',
          'Name='+opts.appName,
          'Comment=' + opts.appName + ' startup script',
          'Exec=' + opts.appPath,
          'StartupNotify=false',
          'Terminal=false'
        ].join('\n')

        mkdirp.sync(@getDir())
        fs.writeFileSync(file, data)
        cb()

    disable: (opts, cb) ->
        file = @getFile(opts)
        if fs.existsSync(file)
            fs.unlinkSync(file)
        cb()

    isEnabled: (opts, cb) ->
        file = @getFile(opts)
        cb(fs.existsSync(file))
