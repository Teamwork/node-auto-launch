module.exports = class AutoLaunchHelper
    constructor: (autoLaunch) ->
        @autoLaunch = autoLaunch

    ensureEnabled: ->
        @autoLaunch.isEnabled().then (enabled) =>
            @autoLaunch.enable() unless enabled

    ensureDisabled: ->
        @autoLaunch.isEnabled().then (enabled) =>
            @autoLaunch.disable() if enabled

    mockApi: (stubs) ->
        @autoLaunch.api = stubs
