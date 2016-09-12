node-auto-launch
==============

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Windows Build Status][appveyor-image]][appveyor-url] [![Dependency Status][depstat-image]][depstat-url]

---

Launch applications or executables at login (Mac, Windows and Linux). Perfect for [NW.js](https://github.com/nwjs/nw.js) and [Electron](http://electron.atom.io/) apps (with or without Squirrel). Also handles Electron updates on Windows so the correct version of your app is launched when using the auto updater.

## Notes
 - Node V4 or greater is required.
 - With v4.0.0 the ES6-Promise dependency has been removed. This module automatically overwrote Promise in the global namespace. If upgrading to v3 check to make sure this will not affect your project.

## Installation

`npm install auto-launch`

## Usage

The API consists only of `enable`, `disable`, and `isEnabled`.

```javascript
var AutoLaunch = require('auto-launch');

var minecraftAutoLauncher = new AutoLaunch({
	name: 'Minecraft',
	path: '/Applications/Minecraft.app',
	isHidden: true
});

minecraftAutoLauncher.enable();
//minecraftAutoLauncher.disable();
```

For NW.js or Electron apps you don't have to specify the path. It gets read from `process.execPath` :)

```javascript
var AutoLaunch = require('auto-launch');

var appLauncher = new AutoLaunch({
	name: 'My NW.js or Electron app'
});

appLauncher.isEnabled().then(function(enabled){
	if(enabled) return;
	return appLauncher.enable()
}).then(function(err){

});
```

Note: I added a method (`removeNwjsLoginItem`) to remove 'nwjs helper' app login item that might have been added to peoples accounts since the name change from node-webkit to NW.js.


## TODO:

- Add `getCurrentPath` - So you can check if the app has moved around.


[npm-url]: https://npmjs.org/package/auto-launch
[npm-image]: http://img.shields.io/npm/v/auto-launch.svg?style=flat

[appveyor-url]: https://ci.appveyor.com/project/adam-lynch/node-auto-launch/branch/master
[appveyor-image]: https://ci.appveyor.com/api/projects/status/0sraxp65vrj2axc3/branch/master?svg=true

[travis-url]: http://travis-ci.org/Teamwork/node-auto-launch
[travis-image]: http://img.shields.io/travis/Teamwork/node-auto-launch.svg?style=flat

[depstat-url]: https://david-dm.org/teamwork/node-auto-launch
[depstat-image]: https://david-dm.org/teamwork/node-auto-launch.svg?style=flat
