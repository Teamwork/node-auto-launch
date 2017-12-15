# Open to improvements

Feel free to submit pull-requests or suggestions via issues to improve this process, any document, or any of the code. Your help is appreciated.


# Guidelines

- Try to follow the code style in the script you're editing or surrounding scripts.
- Write comments.
- Take care that this module supports Windows, Mac, and Linux, NW.js and Electron, with or without Squirrel (auto-updating).
- Be nice.


# Setup

1. `npm install`
2. Install the [EditorConfig](http://editorconfig.org) plugin for your IDE / text-editor.


# Running tests

1. `npm test`


# Publishing a new version

1. Tests must pass. I.e. Travis and AppVeyor builds should have successfully ran for the last commit. It would be good if you ran the tests locally too to be safe, especially on Mac as we don't have a service like Travis or AppVeyor to run them on, and because we have Mac-only options.
2. Manually bump version in `package.json`.
3. Publish new version to npm.
4. Commit & push version bump as `{{new_version}}`.
5. Publish GitHub release.