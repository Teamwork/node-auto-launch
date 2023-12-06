applescript         = require 'applescript'
untildify           = require 'untildify'
fileBasedUtilities  = require './fileBasedUtilities'


module.exports =

    ### Public ###

    # options - {Object}
    #   :appName - {String}
    #   :appPath - {String}
    #   :isHiddenOnLaunch - {Boolean}
    #   :extraArgs - {Sting}
    #   :mac - (Optional) {Object}
    #       :useLaunchAgent - (Optional) {Boolean}
    # Returns a Promise
    enable: ({appName, appPath, isHiddenOnLaunch, extraArgs, mac}) ->

        # Add the file if we're using a Launch Agent
        if mac.useLaunchAgent
            programArguments = [appPath]
            programArguments.push '--hidden' if isHiddenOnLaunch
            programArguments = programArguments.concat extraArgs.split(" ") if extraArgs?
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

        # Otherwise, use default method; use AppleScript to tell System Events to add a Login Item

        isHiddenValue = if isHiddenOnLaunch then 'true' else 'false'
        properties = "{path:\"#{appPath}\", hidden:#{isHiddenValue}, name:\"#{appName}\"}"

        return @execApplescriptCommand "make login item at end with properties #{properties}"


    # appName - {String}
    # mac - {Object}
    #   :useLaunchAgent - {Object}
    # Returns a Promise
    disable: (appName, mac) ->
        # Delete the file if we're using a Launch Agent
        return fileBasedUtilities.removeFile @getFilePath appName if mac.useLaunchAgent

        # Otherwise remove the Login Item
        return @execApplescriptCommand "delete login item \"#{appName}\""


    # appName - {String}
    # mac - {Object}
    #   :useLaunchAgent - {Object}
    # Returns a Promise which resolves to a {Boolean}
    isEnabled: (appName, mac) ->
        # Check if the Launch Agent file exists
        return fileBasedUtilities.isEnabled @getFilePath appName if mac.useLaunchAgent

        # Otherwise check if a Login Item exists for our app
        return @execApplescriptCommand('get the name of every login item').then (loginItems) ->
            return loginItems? and appName in loginItems


    ### Private ###


    # commandSuffix - {String}
    # Returns a Promise
    execApplescriptCommand: (commandSuffix) ->
        return new Promise (resolve, reject) ->
            applescript.execString "tell application \"System Events\" to #{commandSuffix}", (err, result) ->
                return reject err if err?
                resolve result


    # Returns a {String}
    getDirectory: -> untildify '~/Library/LaunchAgents/'


    # appName - {String}
    # Returns a {String}
    getFilePath: (appName) -> "#{@getDirectory()}#{appName}.plist"
