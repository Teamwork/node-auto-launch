fs = require('fs')
mkdirp = require('mkdirp')
untildify = require('untildify')

dir = untildify('~/Library/LaunchAgents')

module.exports =
    getFile: (opts) ->
        file = dir+opts.appName+'.plist'
        return file

    enable: (opts) ->
        new Promise (resolve, reject) =>
            file = @getFile(opts)
            array = [opts.appPath]
            if(opts.isHiddenOnLaunch) then array.push('--hidden')
            command = array.map((a) -> "    <string>#{a}</string>")
                .join('\n')

            data = """<?xml version="1.0" encoding="UTF-8"?>
                    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
                    <plist version="1.0">
                    <dict>
                      <key>Label</key>
                      <string>#{name}</string>
                      <key>ProgramArguments</key>
                      <array>
                      #{command}
                      </array>
                      <key>RunAtLoad</key>
                      <true/>
                    </dict>
                    </plist>"""

            mkdirp.sync(dir)
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
        new Promise (resolve) =>
            file = @getFile(opts)

            fs.stat file, (err, stat) ->
    # TODO: Error handling
                resolve(stat?)
