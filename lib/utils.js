const fs = require('fs')

/** Encodings supported by Node
 * @see https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings
 * @see https://github.com/nodejs/node/blob/master/lib/buffer.js#L586
 */
const VALID_ENCODINGS = [
  'utf8',
  'utf16le',
  'latin1',
  'base64',
  'hex',
  'ascii',
  'binary',
  'ucs2'
]

/**
 * Cast a given value to boolean, supporting string boolean values ('true', 'false')
 * @param {String|Boolean} value Value to cast to boolean
 * @throws if value is not a boolean
 * @returns {Boolean}
 */
const castBoolean = (value) => {
  if (value === 'true' || value === 'false') {
    return value === 'true'
  } else if (typeof value !== 'boolean') {
    throw new Error('Provided value is not a boolean')
  }

  return value
}

/**
 * Validate that given encoding is supported
 * @param {String} encoding Encoding to validate
 * @throws if encoding is not a string or not supported
 * @returns {void}
 */
const validateEncoding = (encoding) => {
  if (typeof encoding !== 'string') {
    throw new Error('Encoding is not a string')
  } else if (VALID_ENCODINGS.indexOf(encoding) === -1) {
    throw new Error('Provided value is not a valid encoding')
  }
}

/**
 * Throw option validation error
 * @param {String} option Option that throws
 * @param {any} original Option original value
 */
const throwError = (option, original) => {
  throw new Error(`Invalid value provided to ${option} option: ${original}`)
}

/**
 * Validate options object passed to constructor
 * @param {Object} options Object of options to validate
 * @throws if an option is invalid
 * @returns {Object} Casted options object
 */
const validateOptions = (options) => {
  // Default values
  const castedOptions = Object.assign({
    follow: false,
    lines: 10,
    retry: false,
    sleepInterval: 1000,
    encoding: 'utf8'
  }, options)

  // bytes option has no default, we need to make sure it is present before checking it
  if (castedOptions.bytes && isNaN(castedOptions.bytes)) {
    throwError('bytes', castedOptions.bytes)
  }

  try {
    castedOptions.follow = castBoolean(castedOptions.follow)
  } catch (err) {
    throwError('follow', castedOptions.follow)
  }

  if (isNaN(castedOptions.lines)) {
    throwError('lines', castedOptions.lines)
  }

  try {
    castedOptions.retry = castBoolean(castedOptions.retry)
  } catch (err) {
    if (castedOptions.retry) {
      if (castedOptions.retry.timeout && isNaN(castedOptions.retry.timeout)) {
        throwError('retry.timeout', castedOptions.retry.timeout)
      }

      if (castedOptions.retry.max && isNaN(castedOptions.retry.max)) {
        throwError('retry.max', castedOptions.retry.max)
      }
    }

    if (!castedOptions.retry.timeout && !castedOptions.retry.max) {
      throwError('retry', castedOptions.retry)
    }
  }

  if (isNaN(castedOptions.sleepInterval)) {
    throwError('sleepInterval', castedOptions.sleepInterval)
  }

  try {
    validateEncoding(castedOptions.encoding)
  } catch (err) {
    throwError('encoding', castedOptions.encoding)
  }

  return castedOptions
}

/**
 * Check if given fd is a valid file descriptor
 * @param {Number} fd File descriptor
 * @throws original fs.fstatSync error
 * @returns {Boolean} indicating fd is valid or not
 */
const getFileDescriptor = (fd) => {
  if (fd && typeof fd === 'number') {
    try {
      fs.fstatSync(fd)

      return fd
    } catch (err) {
      if (err.code === 'EBADF') {
        return false
      }

      throw err
    }
  } else if (fd && fd.fd) {
    return getFileDescriptor(fd.fd)
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

module.exports = {
  validateOptions,
  getFileDescriptor,
  createDebugger
}
