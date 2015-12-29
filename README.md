node-auto-launch
==============

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Windows Build Status][appveyor-image]][appveyor-url] [![Dependency Status][depstat-image]][depstat-url]

---

Launch applications or executables at login (Mac, Windows and Linux). Perfect for [NW.js](https://github.com/nwjs/nw.js) and [Electron](http://electron.atom.io/) apps.

## Installation

`npm install auto-launch`

## General

So far the api consists only `enable` `disable` and `isEnabled`.

## Usage

For NW.js or Electron apps you don't have to specify the path. It gets read from `process.execPath` :)

```javascript
var AutoLaunch = require('auto-launch');

var appLauncher = new AutoLaunch({
	name: 'My NW.js or Electron app'
});

appLauncher.isEnabled(function(enabled){
	if(enabled) return;

	appLauncher.enable(function(err){

	});

});
```

Note: I added a method (`removeNwjsLoginItem`) to remove 'nwjs helper' app login item that might have been added to peoples accounts since the name change from node-webkit.

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

- Add `getCurrentPath` - So you can check if the app has moved a roundabout.


[npm-url]: https://npmjs.org/package/auto-launch
[npm-image]: http://img.shields.io/npm/v/auto-launch.svg?style=flat

[appveyor-url]: https://ci.appveyor.com/project/adam-lynch/node-auto-launch/branch/master
[appveyor-image]: https://ci.appveyor.com/api/projects/status/0sraxp65vrj2axc3/branch/master?svg=true

[travis-url]: http://travis-ci.org/Teamwork/node-auto-launch
[travis-image]: http://img.shields.io/travis/Teamwork/node-auto-launch.svg?style=flat

[depstat-url]: https://david-dm.org/teamwork/auto-launch
[depstat-image]: https://david-dm.org/teamwork/auto-launch.svg?style=flat
