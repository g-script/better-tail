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
    throw new Error(`Invalid value provided to bytes option: ${castedOptions.bytes}`)
  }

  try {
    castedOptions.follow = castBoolean(castedOptions.follow)
  } catch (err) {
    throw new Error(`Invalid value provided to follow option: ${castedOptions.follow}`)
  }

  if (isNaN(castedOptions.lines)) {
    throw new Error(`Invalid value provided to bytes option: ${castedOptions.lines}`)
  }

  try {
    castedOptions.retry = castBoolean(castedOptions.retry)
  } catch (err) {
    throw new Error(`Invalid value provided to follow option: ${castedOptions.retry}`)
  }

  if (isNaN(castedOptions.sleepInterval)) {
    throw new Error(`Invalid value provided to sleepInterval option: ${castedOptions.sleepInterval}`)
  }

  try {
    validateEncoding(castedOptions.encoding)
  } catch (err) {
    throw new Error(`Invalid value provided to encoding: ${castedOptions.encoding}`)
  }

  return castedOptions
}

module.exports = {
  validateOptions,
}
