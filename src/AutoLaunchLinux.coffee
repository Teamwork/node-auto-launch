untildify           = require 'untildify'
fileBasedUtilities  = require './fileBasedUtilities'

module.exports =

    ### Public ###

    # options - {Object}
    #   :appName - {String}
    #   :appPath - {String}
    #   :isHiddenOnLaunch - {Boolean}
    #   :extraArgs - {Sting}
    # Returns a Promise
    enable: ({appName, appPath, isHiddenOnLaunch, extraArgs}) ->
        hiddenArg = if isHiddenOnLaunch then ' --hidden' else ''
        args = if extraArgs? then (hiddenArg + ' ' + extraArgs) else hiddenArg

        data = """[Desktop Entry]
                Type=Application
                Version=1.0
                Name=#{appName}
                Comment=#{appName} startup script
                Exec=#{appPath}#{args}
                StartupNotify=false
                Terminal=false"""

        return fileBasedUtilities.createFile {
            data
            directory: @getDirectory()
            filePath: @getFilePath appName
        }


    # appName - {String}
    # Returns a Promise
    disable: (appName) -> fileBasedUtilities.removeFile @getFilePath appName


    # appName - {String}
    # Returns a Promise which resolves to a {Boolean}
    isEnabled: (appName) -> fileBasedUtilities.isEnabled @getFilePath appName


    ### Private ###


    # Returns a {String}
    getDirectory: -> untildify '~/.config/autostart/'


    # appName - {String}
    # Returns a {String}
    getFilePath: (appName) -> "#{@getDirectory()}#{appName}.desktop"
