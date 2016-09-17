untildify           = require 'untildify'
fileBasedUtilities  = require './fileBasedUtilities'

module.exports =

    ### Public ###

    # options - {Object}
    #   :appName - {String}
    #   :appPath - {String}
    #   :isHiddenOnLaunch - {Boolean}
    # Returns a Promise
    enable: ({appName, appPath, isHiddenOnLaunch}) ->
        programArguments = [appPath]
        programArguments.push '--hidden' if isHiddenOnLaunch
        programArgumentsSection = programArguments
            .map((argument) -> "    <string>#{argument}</string>")
            .join('\n')

        data = """<?xml version="1.0" encoding="UTF-8"?>
                <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
                <plist version="1.0">
                <dict>
                  <key>Label</key>
                  <string>#{appName}</string>
                  <key>ProgramArguments</key>
                  <array>
                  #{programArgumentsSection}
                  </array>
                  <key>RunAtLoad</key>
                  <true/>
                </dict>
                </plist>"""

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
    getDirectory: -> untildify '~/Library/LaunchAgents/'


    # appName - {String}
    # Returns a {String}
    getFilePath: (appName) -> "#{@getDirectory()}#{appName}.plist"