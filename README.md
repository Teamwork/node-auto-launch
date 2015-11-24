node-auto-launch
==============

[![NPM version][npm-image]][npm-url] [![Windows Build Status][appveyor-image]][appveyor-url] [![Dependency Status][depstat-image]][depstat-url]

---

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

I added a method (`removeNwjsLoginItem`) to remove 'nwjs helper' app login item that might have been added to peoples accounts since the name change from node-webkit.

For general apps

```javascript
var AutoLaunch = require('auto-launch');

var minecraftAutoLauncher = new AutoLaunch({
	name: 'Minecraft',
	path: '/Applications/Minecraft.app',
	isHidden: true // hidden on launch - only works on a mac atm.
});

minecraftAutoLauncher.enable();
//minecraftAutoLauncher.disable();
```

## TODO:

- Figure out what's wrong with the damn tests.
- Add `getCurrentPath` - So you can check if the app has moved a roundabout.


[npm-url]: https://npmjs.org/package/auto-launch
[npm-image]: http://img.shields.io/npm/v/auto-launch.svg?style=flat

[appveyor-url]: https://ci.appveyor.com/project/teamwork/node-auto-launch/branch/master
[appveyor-image]: [![Build status](https://ci.appveyor.com/api/projects/status/0sraxp65vrj2axc3/branch/master?svg=true)](https://ci.appveyor.com/project/adam-lynch/node-auto-launch/branch/master)

[depstat-url]: https://david-dm.org/teamwork/auto-launch
[depstat-image]: https://david-dm.org/teamwork/auto-launch.svg?style=flat