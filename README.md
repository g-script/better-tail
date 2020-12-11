[npmshield]: https://img.shields.io/npm/v/better-tail.svg
[npmpackage]: https://www.npmjs.com/package/better-tail
[standardshield]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard]: https://standardjs.com
[licenseshield]: https://img.shields.io/github/license/mashape/apistatus.svg
[license]: https://github.com/g-script/better-tail/blob/master/LICENSE
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
[versioning]: #1234-versioning
[authors]: #octocat-authors
[acknowledgments]: #pray-acknowledgments
[semver]: http://semver.org
[repotags]: https://github.com/g-script/better-tail/tags
[nicolas-goudry]: https://github.com/nicolas-goudry
[lucagrulla]: https://github.com/lucagrulla

# better-tail

Node.js implementation of UNIX `tail` command using streams. No dependencies :no_entry_sign:.

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
- [:1234: Versioning][versioning]
- [:octocat: Authors][authors]
- [:pray: Acknowledgments][acknowledgments]

## :fire: Motivation

I needed to tail files for a corporate side project, made a few research on what was available, but nothing could 100% match my needs:

- did not find any package allowing to tail **with or without** following file
- did not find any package allowing to **target file’s N last lines**
- lots of them use EventEmitter rather than Stream
- lots of them are unmaintained since _years_
- majority have unneeded dependencies

---

At first, I wanted to tweak [Luca Grulla’s `tail`][lucagrullatail] package to add the features I needed. But, boy, it’s written in Coffeescript :man_facepalming:. What a nightmare (at least, for me).

So, I ended up decaffeinating it and rewriting it in pure JS. Then tweaked it as I wanted.

What I came up with was great, working and all, but then I stumbled upon an issue where lines were mixed when file from which I was reading was being appended too fast. This **is** an [open issue of `tail`][tailissue]

:thinking: “Why not use streams after all ?” Makes sense.

Let me introduce you to `better-tail` then !

*Note: not that it’s better than others, but other package names are either squatted or unavailable.*

:point_down::point_down::point_down:

## :floppy_disk: Installation

**Node.js version 6.3 or higher is required.**

```bash
npm install better-tail --save # or yarn add better-tail
```

## :beginner: Usage

```js
const Tail = require('better-tail')

const tail = new Tail('path-to-file-to-tail')

tail.on('data', function (line) {
  console.log(line)
}).on('error', function (err) {
  console.error(err)
})
```

## :nut_and_bolt: Parameters

Only `target` parameter is required.

### :dart: Target

First parameter is the target to tail data from. It can be:
- a string representing target file path
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

Second parameter is an object of following `options`. Those options are equivalent to UNIX `tail` command.

#### bytes _(default: undefined)_

Number of bytes to tail. Can be prepend with `+` to start tailing from given byte.

```js
// Will return lines in last 42 bytes of target content
new Tail(target, { bytes: 42 })

// Will return lines starting from byte 42 until target content end
new Tail(target, { bytes: '+42' })
```

_If this option is set, it superseeds [lines option][lines-option]._

#### follow _(default: false)_

Follow target new content. This option keeps polling target for new content until you stop following it.

Related:
- [sleepInterval option][sleepinterval-option]
- [unfollow method][unfollow-method]

```js
const tail = new Tail(target, { follow: true })

tail.on('data', function (line) {
  console.log(line)
}).on('error', function (err) {
  console.error(err)
})

setTimeout(function () {
  tail.unfollow()
}, 5000)
```

#### lines _(default: 10)_

Number of lines to tail. Can be prepend with `+` to start tailing from given line.

```js
// Will return last 42 lines of target content
new Tail(target, { bytes: 42 })

// Will return lines starting from line 42 until target content end
new Tail(target, { bytes: '+42' })
```

_This option is superseeded by [bytes option][bytes-option]._

#### retry _(default: false)_

Keep trying to open target file if it is inaccessible.

#### sleepInterval _(default: 1000)_

Sleep for approximately N milliseconds between target content next poll.

_This option has no effect if [follow option][follow-option] is set to `false`._

#### encoding _(default: 'utf8')_

Set target’s content encoding.

## :scroll: Methods

### unfollow

Stop following target file. This method will also destroy underlying stream.

_This method has no effect if [follow option][follow-option] is set to `false`._

## :calendar: Events

### data

As with classic readable streams, data is emitted through this event.

:warning: Data is always emitted as a Buffer object encoded with given [encoding option][encoding-option].

```js
new Tail(target).on('data', function (line) {
  console.log(line.toString('utf8'))
})
```

### error

Errors will be emitted through this event. If an error is emitted, underlying stream is destroyed.

Errors can be emitted in following scenarios:
- an invalid target was provided
- could not guess target type
- failed to access target
- failed to get target content
- failed to get target size
- failed to create read stream to read target content

### end

This event is emitted each time target content end is reached. Therefore, it can fire multiple times if [follow option][follow-option] is set to `true`.

## :construction: What’s coming next?

- lines will be emitted through a new `line` event
- lines will be emitted as a string encoded with given encoding option, removing the pain of doing `.toString('utf8')` on each emitted event
- raw data (as Buffer) will be emitted through `data` event
- add support for readable streams not targetting files

## :1234: Versioning

This project uses [SemVer][semver] for versioning. For the versions available, see the [tags on this repository][repotags]. 

## :octocat: Authors

* **Nicolas Goudry** - *Initial work* - [nicolas-goudry][nicolas-goudry]

## :pray: Acknowledgments

Obviously, [Luca Grulla][lucagrulla] for inspiring me to do this.
