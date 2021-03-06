# better-tail

Node.js implementation of UNIX `tail` command using streams. No dependencies :no_entry_sign:.

[![Actions Status][actionshield]][actions]
[![npm][npmshield]][npmpackage]
[![JavaScript Style Guide][standardshield]][standard]
[![license][licenseshield]][license]

## :book: Table of contents

- [:fire: Motivation][motivation]
- [:floppy_disk: Installation][installation]
- [:beginner: Usage][usage]
- [:nut_and_bolt: Parameters][parameters]
  - [:dart: Target][target]
  - [:speech_balloon: Options][options]
    - [bytes][bytes-option]
    - [follow][follow-option]
    - [lines][lines-option]
    - [retry][retry-option]
    - [sleepInterval][sleepinterval-option]
    - [encoding][encoding-option]
- [:scroll: Methods][methods]
  - [unfollow][unfollow-method]
- [:calendar: Events][events]
  - [data][data-event]
  - [error][error-event]
  - [end][end-event]
- [:construction: What’s coming next?][next]
- [:beetle: Debugging][debugging]
- [:game_die: Running tests][running-tests]
- [:busts_in_silhouette: Contributing][contributing]
- [:1234: Versioning][versioning]
- [:octocat: Authors][authors]
- [:pray: Acknowledgments][acknowledgments]

## :fire: Motivation

I needed to tail files for a corporate side project, made a few research on what was available, but nothing could 100% match my needs:

- did not find any package allowing to tail **with or without** following file
- did not find any package allowing to **target file’s N last lines**
- lots of them extends EventEmitter rather than Stream
- lots of them are unmaintained since _years_
- majority have unneeded dependencies

---

At first, I wanted to tweak [Luca Grulla’s `tail`][lucagrullatail] package to add the features I needed. But, boy, it’s written in Coffeescript :man_facepalming:. What a nightmare (at least, for me).

So, I ended up decaffeinating it and rewriting it in pure JS. Then tweaked it as I wanted.

What I came up with was great, working and all, but then I stumbled upon an issue where lines were mixed when file from which I was reading was being appended too fast. This **is** an [open issue of `tail`][tailissue].

:thinking: “Why not use streams after all ?” Makes sense.

Let me introduce you to `better-tail` then !

> _Note: not that it’s better than others, but other package names are either squatted or unavailable._

:point_down::point_down::point_down:

## :floppy_disk: Installation

**Node.js version 8 or higher is required.**

```bash
npm install better-tail --save # or yarn add better-tail
```

## :beginner: Usage

```js
const Tail = require('better-tail')

const tail = new Tail('path-to-file-to-tail')

tail.on('line', function (line) {
  console.log(line)
}).on('error', function (err) {
  console.error(err)
})
```

### :bulb: **Good to know**

#### New line at end of target file

If target file ends with a newline, last [`line` and `data` events][events] will emit an empty string.

This behavior is **not to be expected** with [`follow` option][follow-option] set to `true`.

#### Truncating target file

If target file content is truncated while reading, [`line` and `data` events][events] will be emitted with following message : 

```
better-tail: file truncated
```

Reading will then start again with original options.

Example:

```js
new Tail(target, { follow: true, lines: 1 })

// Data is flowing
`Some content
is written
to target file
and suddenly
`

// Data is truncated
`Some content
is written
to tar
`

// Emitted events would be
`better-tail: file truncated`

// Followed by
`to tar`
```

We only asked for last line (`lines: 1`), so after truncating, tailing « restarts » and only emits last line of target file.

## :nut_and_bolt: Parameters

Only `target` parameter is required.

### :dart: Target

First parameter is the target to tail data from. It can be:
- the string path to target file
- a readable stream of target file
- a file descriptor of target file

```js
const fs = require('fs')

// Tail file from path
new Tail('./some-file')

// Tail file from readable stream
new Tail(fs.createReadStream('./some-file', { encoding: 'utf8' }))

// Tail file from file descriptor
new Tail(fs.openSync('./some-file', 'r'))
```

### :speech_balloon: Options

Second parameter is an object of following `options` (heavily inspired by UNIX `tail` command options):

#### bytes _(default: undefined)_

Number of bytes to tail. Can be prepended with `+` to start tailing from given byte.

> _If this option is set, it supersedes [lines option][lines-option]._

```js
// Will return lines in last 42 bytes of target content
new Tail(target, { bytes: 42 })

// Will return lines starting from byte 42 until target content end
new Tail(target, { bytes: '+42' })
```
#### follow _(default: false)_

Keeps polling target file for appended data until you stop following it.

Related:
- [sleepInterval option][sleepinterval-option]
- [unfollow method][unfollow-method]

```js
const tail = new Tail(target, { follow: true })

tail.on('line', function (line) {
  console.log(line)
}).on('error', function (err) {
  console.error(err)
})

setTimeout(function () {
  tail.unfollow()
}, 5000)
```

#### lines _(default: 10)_

Number of lines to tail. Can be prepended with `+` to start tailing from given line.

> _This option is superseded by [bytes option][bytes-option]._

```js
// Will return last 42 lines of target content
new Tail(target, { bytes: 42 })

// Will return lines starting from line 42 until target content end
new Tail(target, { bytes: '+42' })
```

#### retry _(default: false)_

Can either be a boolean:
- `true`: keep trying to open target file until it is accessible
- `false`: emit an error if file is inaccessible

Or an object with following properties:
- **interval**: wait for given milliseconds between retries
- **timeout**: abort retrying after given milliseconds
- **max**: abort retrying after given retries count

If given an object, it means **target file opening will be retried upon failure**.

> _This option uses [sleepInterval option][sleepinterval-option] value by default to wait between retries if `interval` property is not set._

```js
// Will retry indefinitly, approximately each second (default value of sleepInterval option), until file is accessible
new Tail(target, { retry: true })

// Will wait for approximately 5 seconds between retries
new Tail(target, { retry: { interval: 5000 } })

// Will retry for approximately 5 seconds before aborting
new Tail(target, { retry: { timeout: 5000 } })

// Will retry 3 times before aborting
// Note: first try is not counted, so file access will be tried 4 times
new Tail(target, { retry: { max: 3 } })

// Will retry 5 times or approximately 3 seconds before aborting
new Tail(target, { retry: { timeout: 3000, max: 5, interval: 500 } })
```

#### sleepInterval _(default: 1000)_

Sleep for approximately N milliseconds between target file polls.

> _This option has no effect if [follow option][follow-option] is set to `false`._

```js
// Will poll target file data approximately each 5 seconds
new Tail(target, { follow: true, sleepInterval: 5000 })
```

#### encoding _(default: 'utf8')_

Set target file's content encoding.

Supported encodings are [those supported by Node.js][node-encodings]:
- `utf8`
- `utf16le`
- `latin1`
- `base64`
- `hex`
- `ascii`
- `binary`
- `ucs2`

[:bulb: Seeking help for testing this option][encoding-tests-help-wanted]

## :scroll: Methods

### unfollow

Stop following target file. This method will also destroy underlying stream.

_This method has no effect if [follow option][follow-option] is set to `false`._

## :calendar: Events

### line

Decoded lines are emitted through this event.

```js
new Tail(target).on('line', function (line) {
  console.log(line)
})
```

### data

Lines encoded to a Buffer object with given [encoding option][encoding-option] are emitted through this event.

```js
new Tail(target).on('data', function (chunk) {
  console.log(chunk.toString('utf8'))
})
```

### error

Errors will be emitted through this event. If an error is emitted, underlying stream is destroyed.

Errors can be emitted in following scenarios:
- an invalid option was provided
- an invalid target was provided
- could not guess target type
- failed to access target (or retry error)
- failed to get target content
- failed to get target size
- failed to create read stream to read target content

### end

This event is emitted each time target file content end is reached. Therefore, it can fire multiple times if [follow option][follow-option] is set to `true`.

## :construction: What’s coming next?

- add support for readable streams not targetting files

## :beetle: Debugging

Debugging is built-in and can be triggered in two ways:
- defining the environment variable `DEBUG_TAIL` (to any value)
- defining the constructor `debug` option to:
  - `true`
  - a function that takes a message as it first argument

If `DEBUG_TAIL` environment variable is defined, but `debug` option is not set, debugging will default to `console.log`. Same behavior apply if `debug` option is set to `true`.

If `debug` option is a function, it will be run with a single message argument.

## :game_die: Running tests

This package is tested against multiple different scenarios with [Mocha][mocha] and [chai][chai] (through `expect` BDD style).

In order to run tests locally, you have to:
- clone this repository
- install development dependencies with `npm install` (or `yarn install`)
- run tests with `npm test` (or `yarn test`)

> _Tests are run in bail mode. This means that whenever a test fails, all following tests are aborted._

### Debugging tests buffers

Because tests work with buffers, it can be tedious to debug them and understand why they fail.

To make this easier, you can define a `DEBUG_BUFFERS` environment variable (to any value) in order to enable « buffers debugging mode ». This mode will simply write two files for each tests failing (each file is prefixed by test number `x`):
- expected result: `x_expected.log`
- received result: `x_received.log`

## :busts_in_silhouette: Contributing

See [CONTRIBUTING.md][contribute].

## :1234: Versioning

This project uses [SemVer][semver] for versioning. For the versions available, see the [tags on this repository][repotags]. 

## :octocat: Authors

* **Nicolas Goudry** - *Initial work* - [nicolas-goudry][nicolas-goudry]

## :pray: Acknowledgments

Obviously, [Luca Grulla][lucagrulla] for inspiring me to do this.

[actionshield]: https://github.com/g-script/better-tail/workflows/Lint%20and%20test%20JS%20files/badge.svg
[actions]: https://github.com/g-script/better-tail/actions
[npmshield]: https://img.shields.io/npm/v/better-tail.svg
[npmpackage]: https://www.npmjs.com/package/better-tail
[standardshield]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard]: https://standardjs.com
[licenseshield]: https://img.shields.io/github/license/mashape/apistatus.svg
[license]: https://github.com/g-script/better-tail/blob/main/LICENSE
[lucagrullatail]: https://www.npmjs.com/package/tail
[tailissue]: https://github.com/lucagrulla/node-tail/issues/115
[motivation]: #fire-motivation
[installation]: #floppy_disk-installation
[usage]: #beginner-usage
[parameters]: #nut_and_bolt-parameters
[target]: #dart-target
[options]: #speech_balloon-options
[bytes-option]: #bytes-default-undefined
[follow-option]: #follow-default-false
[lines-option]: #lines-default-10
[retry-option]: #retry-default-false
[sleepinterval-option]: #sleepinterval-default-1000
[encoding-option]: #encoding-default-utf8
[methods]: #book-methods
[unfollow-method]: #unfollow
[events]: #calendar-events
[data-event]: #data
[error-event]: #error
[end-event]: #end
[next]: #construction-whats-coming-next
[debugging]: #beetle-debugging
[running-tests]: #game_die-running-tests
[mocha]: https://mochajs.org
[chai]: https://www.chaijs.com/api/bdd/
[contributing]: #busts_in_silhouette-contributing
[contribute]: https://github.com/g-script/better-tail/blob/main/CONTRIBUTING.md
[versioning]: #1234-versioning
[authors]: #octocat-authors
[acknowledgments]: #pray-acknowledgments
[semver]: http://semver.org
[repotags]: https://github.com/g-script/better-tail/tags
[nicolas-goudry]: https://github.com/nicolas-goudry
[lucagrulla]: https://github.com/lucagrulla
[node-encodings]: https://nodejs.org/docs/latest-v14.x/api/buffer.html#buffer_buffers_and_character_encodings
[encoding-tests-help-wanted]: https://github.com/g-script/better-tail/issues/20
