fs      = require 'fs'
mkdirp  = require 'mkdirp'

# Public: a few utils for file-based auto-launching
module.exports =

    ### Public ###

    # This is essentially enabling auto-launching
    # options - {Object}
    #   :data - {String}
    #   :directory - {String}
    #   :filePath - {String}
    # Returns a Promise
    createFile: ({directory, filePath, data}) ->
        return new Promise (resolve, reject) ->
            mkdirp directory, (mkdirErr) ->
                return reject mkdirErr if mkdirErr?
                fs.writeFile filePath, data, (writeErr) ->
                    return reject(writeErr) if writeErr?
                    resolve()


    # filePath - {String}
    isEnabled: (filePath) ->
        return new Promise (resolve, reject) =>
            fs.stat filePath, (err, stat) ->
                return resolve false if err?
                resolve(stat?)


    # This is essentially disabling auto-launching
    # filePath - {String}
    # Returns a Promise
    removeFile: (filePath) ->
        return new Promise (resolve, reject) =>
            fs.stat filePath, (statErr) ->
                # If it doesn't exist, this is good so resolve
                return resolve() if statErr?

                fs.unlink filePath, (unlinkErr) ->
                    return reject(unlinkErr) if unlinkErr?
                    resolve()