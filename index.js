const fs = require('fs')
const readline = require('readline')
const { Readable } = require('stream')

/**
 * Check if given fd is a valid file descriptor
 * @param {Number} fd File descriptor
 * @throws original fs.fstatSync error
 * @returns {Boolean} indicating fd is valid or not
 */
function isFD (fd) {
  if (fd && typeof fd === 'number') {
    try {
      fs.fstatSync(fd)

      return true
    } catch (err) {
      if (err.code === 'EBADF') {
        return false
      }

      throw err
    }
  }

  return false
}

/**
 * Get debugging function
 * @param {Boolean|Function} debug If true, will set debugger to `console.debug`; if function, will set debugger to this function;
 *                                  if anything else, will set debugger to no-op
 * @returns {Function}
 */
const createDebugger = (debug) => {
  if (typeof debug === 'function') {
    return debug
  }

  if (debug === true || process.env.DEBUG_TAIL) {
    return console.log
  }

  return () => {}
}

class Tail extends Readable {
  /**
   * Get the last 10 lines of given target. If no target is provided, get standard input.
   * @param {String|Number|ReadStream} target Target to tail
   * @param {Object} [options] Tail options
   * @param {Number} [options.bytes] Return the last N bytes; or use +N to output starting with byte N; will be ignored if lines options is set
   * @param {Boolean} [options.follow=false] Return appended data as the file grows
   * @param {Number} [options.lines=10] Return the last N lines; or use +N to output starting with line N; set it to zero or a negative value to return all lines
   * @param {Boolean} [options.retry=false] Keep trying to open a file if it is inaccessible
   * @param {Number} [options.sleepInterval=1000] With follow option set to true, sleep for approximately N milliseconds between iterations
   * @param {String} [options.encoding=utf8] File characters encoding
   * @emits Tail#error if target is invalid or file doesn’t exists or user lacks permissions on file
   * @returns {ReadableStream}
   */
  constructor (target, options) {
    super()

    this.options = Object.assign({
      follow: false,
      lines: 10,
      retry: false,
      sleepInterval: 1000,
      encoding: 'utf8'
    }, options)
    this.debug = createDebugger(this.options.debug)

    this.debug('Tail target:', target)
    this.debug('Tail options:', JSON.stringify(this.options, null, 2))

    this._guessTarget(target)

    if (this.type) {
      this.debug('Target type:', this.type)

      this.ignoreEOFNewline = true
      this.isReading = false
      this._handleLineEvent = this._handleLineEvent.bind(this)
      this._handleCloseEvent = this._handleCloseEvent.bind(this)
      this._handleEndEvent = this._handleEndEvent.bind(this)

      if (this.type === 'path' || this.type === 'fd') {
        this._checkFile(() => {
          this._checkEOFNewline(() => {
            this.cursor = this.options.lines <= 0 ? 0 : this._getCursorPos()

            this._readLines()
          })
        })
      } else {
        this.debug('Target is not a file: set start cursor to 0')

        this.cursor = 0

        this._readLines()
      }
    }

    return this
  }

  /**
     * Guess target type
     * @param {String|Number|ReadStream} [target=process.stdin] Target to tail data from
     * @emits Tail#error if invalid target was provided or fd check failed
     * @returns {void}
     */
  _guessTarget (target) {
    this.debug('Guessing target type')

    try {
      if (!target) {
        this.type = 'stream'
        this.target = process.stdin
        this.options.follow = true
      } else if (isFD(target)) {
        this.type = 'fd'
        this.target = target
      } else if (isFD(target.fd)) {
        this.type = 'fd'
        this.target = target.fd
      } else if (target instanceof fs.ReadStream) {
        this.type = 'stream'
        this.target = target
      } else if (typeof target === 'string') {
        this.type = 'path'
        this.target = target
      } else {
        this.debug('Invalid target provided')
        this.destroy(new Error('Invalid target provided'))
      }
    } catch (err) {
      this.debug('Unknown error:', err)
      this.destroy(err)
    }
  }

  /**
    * Check file access
    * @param {Function} cb Callback
    * @emits Tail#error if file doesn’t exists or user lack permissions on it
    * @returns {void}
    */
  _checkFile (cb) {
    try {
      if (this.type === 'path') {
        this.debug('Checking target availability')

        fs.accessSync(this.target, fs.constants.F_OK | fs.constants.R_OK)

        this.debug('Target is available')
      }

      cb()
    } catch (err) {
      if (this.options.retry) {
        this.debug('Failed to check target, retrying now…')

        return this._checkFile()
      }

      this.debug('Failed to check target availability:', err)
      this.destroy(err)
    }
  }

  /**
   * Get target file content
   * @emits Tail#error if target could not be read
   * @returns {String}
   */
  _getFileContent () {
    let data

    try {
      if (this.type === 'path') {
        data = fs.readFileSync(this.target, {
          encoding: this.options.encoding,
          flag: 'r'
        })
      } else {
        const buff = Buffer.alloc(fs.fstatSync(this.target).size)

        fs.readSync(this.target, buff, 0, buff.length, 0)

        data = buff.toString(this.options.encoding)
      }

      return data
    } catch (err) {
      this.debug('Failed to get target file content:', err)
      this.destroy(err)

      // Always return data
      return ''
    }
  }

  /**
   * Check file EOF
   * @param {Function} cb Callback
   * @returns {void}
   */
  _checkEOFNewline (cb) {
    this.debug('Checking end of file (EOF)')

    const data = this._getFileContent()
    const lines = data.split(/[\r]{0,1}\n/)

    if (!this.options.follow) {
      if (lines[lines.length - 1] === '') {
        this.debug('EOF is a newline')

        this.ignoreEOFNewline = false
      } else {
        this.debug('EOF is a line')
      }
    } else {
      this.debug('EOF will be ignored in follow mode')
    }

    cb()
  }

  /**
    * Get cursor position
    * @returns {Number} line starting bytes
    */
  _getCursorPos () {
    this.debug('Get cursor position')

    const data = this._getFileContent()

    if (this.options.bytes) {
      let byte

      if (this.options.bytes.toString().includes('+')) {
        byte = parseInt(this.options.bytes.replace('+', ''), 10)
      } else {
        byte = Buffer.byteLength(data) - this.options.bytes
      }

      this.debug(`Set cursor to byte ${byte}`)

      return byte
    }

    this.debug(`Search byte matching requested line: ${this.options.lines}`)

    const lines = data.split(/[\r]{0,1}\n/)

    if (this.options.lines >= lines.length) {
      this.debug('Requested line is out of range, set cursor to byte 0')

      return 0
    }

    const removeLast = this.ignoreEOFNewline ? 1 : 0
    let searchFrom

    if (this.options.lines.toString().includes('+')) {
      searchFrom = this.options.lines - removeLast
    } else {
      searchFrom = lines.length - this.options.lines - removeLast
    }

    // This RegExp seeks for nth occurence of line separator
    const match = data.match(new RegExp(`(?:[^\r\n]*[\r]{0,1}\n){${searchFrom}}`))

    if (match && match.length) {
      const bytePosition = Buffer.byteLength(match[0], this.options.encoding)

      this.debug(`Set cursor to byte ${bytePosition}`)

      // Use full match to calculate starting bytes of requested line
      return bytePosition
    }

    this.debug('Failed to find requested line, set cursor to byte 0')

    return 0
  }

  /**
    * Read file data line by line
    * @emits Tail#error if file stat or reading failed
    * @returns {void}
    */
  _readLines () {
    let size

    try {
      if (this.type === 'fd') {
        this.debug('Get target current size (fd)')

        size = fs.fstatSync(this.target).size
      } else if (this.type === 'path') {
        this.debug('Get target current size (path)')

        size = fs.statSync(this.target).size
      }
    } catch (err) {
      this.debug('Failed to get target current size')
      this.destroy(err)

      return
    }

    // Do not read if a reading is in progress
    if (!this.isReading) {
      // Only read file if cursor is different than size
      if (this.cursor !== size) {
        this.debug(`Current cursor position: ${this.cursor}`)
        this.debug(`Next cursor position: ${size}`)

        this.isReading = true

        // Handle case where file was truncated (cursor greater than file size)
        if (this.cursor > size) {
          this.debug('Target data was truncated')

          this.push(Buffer.from('tail : file truncated\n', this.options.encoding))

          this.debug('Cursor position will reset')

          // Reset cursor to last N lines
          this.cursor = this.options.lines <= 0 ? 0 : this._getCursorPos()

          // Reset reading state so it can be read again at next interval tick
          this.isReading = false
        } else {
          this.debug('Read target data')

          let input = this.target

          try {
            if (this.type === 'fd') {
              this.debug('Create read stream (fd)')

              input = fs.createReadStream(null, {
                fd: this.target,
                encoding: this.options.encoding,
                start: this.cursor,
                autoClose: false
              })
            } else if (this.type === 'path') {
              this.debug('Create read stream (path)')

              // We open read stream from last cursor position
              input = fs.createReadStream(this.target, {
                flags: 'r',
                encoding: this.options.encoding,
                start: this.cursor
              })
            }
          } catch (err) {
            this.debug('Error creating read stream:', err)
            this.destroy(err)

            // Do not go further
            return
          }

          this.rl = readline.createInterface({
            input
          }).on('line', this._handleLineEvent).on('close', this._handleCloseEvent)
          input.on('end', this._handleEndEvent)
        }
      }
    } else {
      this.debug('Target is already being read')
    }
  }

  /**
    * Handles readline line event
    * @param {String} line Line data
    * @returns {void}
    */
  _handleLineEvent (line) {
    this.emit('data', Buffer.from(line, this.options.encoding))
  }

  /**
    * Handles readline close event
    * @returns {void}
    */
  _handleCloseEvent () {
    this.debug('Got close event from readline')

    this.isReading = false

    // readline input.bytesRead counts from stream start, so we need to
    // add it to current cursor to get new position after reading
    this.cursor += this.rl.input.bytesRead
  }

  _handleEndEvent () {
    this.debug('Got end event from input read stream')

    if (!this.ignoreEOFNewline) {
      this.emit('data', Buffer.from('', this.options.encoding))
    }

    this.emit('end')
  }

  /**
    * Handles stream reading
    * @returns {void}
    */
  _read () {
    /** Only set interval in follow mode (so stream won’t close)
      * Also make sure interval has not yet been defined so it won’t be set at each _read call
      * If not in follow mode, _createReadInterface is called at least once by constructor
      */
    if (this.options.follow && (this.interval === undefined || (this.interval && this.interval._destroyed))) {
      this.debug('Setup interval')

      this.interval = setInterval(() => {
        this._readLines()
      }, this.options.sleepInterval)
    }
  }

  /**
    * Handles stream destroying
    * @param {Error} err Possible error
    * @param {Function} cb Callback function that takes an optional error argument
    * @returns {void}
    */
  _destroy (err, cb) {
    this.debug('Destroy stream')

    // Close readline if it exists
    if (this.rl) {
      this.debug('Close readline')

      this.rl.close()
    }

    // Clear interval if in follow mode
    if (this.options.follow) {
      this.debug('Clear sleep interval')

      clearInterval(this.interval)
    }

    cb(err)
  }

  /**
    * Stop following file
    * @returns {void}
    */
  unfollow () {
    this.debug('Stop following')
    this.destroy()
  }
}

module.exports = Tail
