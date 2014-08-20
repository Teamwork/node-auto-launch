// Will use this until I get the old tests working
var AutoLaunch = require('./index')

var autoLaunch = new AutoLaunch({
	name: 'Minecraft',
	path: '/Applications/Minecraft.app'
})

autoLaunch.enable(function(){
	console.log(arguments)
	autoLaunch.isEnabled(function(enabled){
		console.log(enabled)
		autoLaunch.disable(function(){
			console.log(arguments)
			autoLaunch.isEnabled(function(enabled){
				console.log(enabled)
			})
		})

	})

})

