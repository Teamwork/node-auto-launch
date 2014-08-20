node-auto-launch
==============

Launch node-webkit apps at login (mac & windows)

## Installation

`npm install auto-launch`

## General

So far the api consists only `enable` `disable` and `isEnabled`.

## Usage

For node-webkit apps you don't have to specify the path. It gets read from `process.execPath` :)

```javascript
var AutoLaunch = require('auto-launch');

var nwAppLauncher = new AutoLaunch({
	name: 'My node webkit app yao'
});

nwAppLauncher.isEnabled(function(enabled){
	if(enabled) return;

	nwAppLauncher.enable(function(err){

	});
	
});
```

For general apps

```javascript
var AutoLaunch = require('auto-launch');

var minecraftAutoLauncher = new AutoLaunch({
	name: 'Minecraft',
	path: '/Applications/Minecraft.app',
	isHidden: true // hidden on launch - only works on a mac atm.
});

minecraftAutoLauncher.enable();
```

## TODO:

- Figure out what's wrong with the damn tests.
- Add `getCurrentPath` - So you can check if the app has moved a roundabout. 