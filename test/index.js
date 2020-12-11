/* eslint-disable */
const chai = require('chai')
const { EventEmitter } = require('events')
const fs = require('fs')
const path = require('path')

const expect = chai.expect
const Tail = require('../index.js')
const DEB_BUFF = process.env.DEBUG_BUFFERS
let curTest = 0

/**
 * Generate a random integer between 1 and a given boundary
 * @param {Number} [boundary=10000] Generation boundary (limit; excluded)
 */
function randomInt(boundary = 10000) {
    return Math.floor(Math.random() * (boundary - 1) + 1)
}

/**
 * Create a random string of random size given a maximum length
 * @param {Number} maxLen String maximum length
 * @returns {String}
 */
function randomString(maxLen) {
    const size = randomInt(maxLen)
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '
    let generatedString = ''

    for (let i = 0; i < size; i++) {
        generatedString += chars[randomInt(chars.length)]
    }

    return generatedString
}

/**
 * Add line terminators to every Buffer in given array
 * @param {Array<Buffer>} buff Array of Buffers to add line terminators to
 * @param {String} [encoding=utf8] Buffers encoding
 * @param {String} [lt=\r\n] Line terminator string to use
 * @returns {Array<Buffer>} Array with line terminators added to each entry Buffer
 */
function addLT(buff, encoding = 'utf8', lt = '\r\n') {
    return buff.map((line, i, arr) => {
        if (i < arr.length - 1) {
            return Buffer.from(line.toString(encoding) + lt, encoding)
        }

        return line
    })
}

/**
 * Compare two buffers, expecting them to be equal
 * Also handles debug files if needed
 * @param {Buffer} buff1 Buffer to compare
 * @param {Buffer} buff2 Buffer to compare
 * @param {String} encoding Buffers encoding
 * @throws if test failed
 * @returns {Boolean} test result
 */
function expectBuffToBeEqual(buff1, buff2, encoding = 'utf8') {
    try {
        expect(buff1.compare(buff2)).to.equal(0, 'Received Buffer does not match expected Buffer')
    } catch (err) {
        if (DEB_BUFF) {
            fs.writeFileSync(getReceivedLogPath(), buff1, { encoding })
            fs.writeFileSync(getExpectedLogPath(), buff2, { encoding })
        }

        throw err
    }
}

/**
 * Build path to current test debug path for received data
 */
const getReceivedLogPath = () => path.resolve(__dirname, `${curTest}_received.log`)

/**
 * Build path to current test debug path for expected data
 */
const getExpectedLogPath = () => path.resolve(__dirname, `${curTest}_expected.log`)

describe('better-tail', function () {
    // Set paths to files used by tests
    const paths = {
        simple: path.resolve(__dirname, 'corpus/alice29.txt'),
        expectations: {
            noOptions: path.resolve(__dirname, 'expectations/01-no-options.txt')
        }
    }
    // Set data used in tests
    const corpus = {
        path: paths.simple,
        fd: fs.openSync(paths.simple, 'r'),
        rs: fs.createReadStream(paths.simple, {
            flags: 'r',
            encoding: 'utf8'
        }),
        expectations: {
            content: fs.readFileSync(paths.simple, { flag: 'r' }),
            noOptions: fs.readFileSync(paths.expectations.noOptions, { flag: 'r' })
        }
    }

    this.retries(4)

    beforeEach(function () {
        // Only increment current test number on first try
        if (this.currentTest.currentRetry() === 0) {
            curTest++
        }
    })

    afterEach(function () {
        // Only process if Buffer debugging is enabled
        if (DEB_BUFF) {
            const curRetry = this.currentTest.currentRetry()
            const maxRetry = this.currentTest.retries()
            
            // Only clean debug log files if current retry lesser than max allowed retries and test is not in error
            if (curRetry > 0 && curRetry < maxRetry && !this.currentTest.err) {
                const receivedLogPath = getReceivedLogPath()
                const expectedLogPath = getExpectedLogPath()

                if (fs.existsSync(receivedLogPath)) {
                    fs.unlinkSync(receivedLogPath)
                }

                if (fs.existsSync(expectedLogPath)) {
                    fs.unlinkSync(expectedLogPath)
                }
            }
        }
    })

    describe('should tail file last 10 lines (default)', function () {
        function test (target, done) {
            const data = []
    
            new Tail(target).on('data', (line) => {
                console.log(line.toString('utf8'))
                data.push(line)
            }).on('end', () => {
                expect(data[0]).to.be.instanceof(Buffer, 'Expected data to be an instance of Buffer')
                expect(data).to.have.lengthOf(10, 'Lines count mismatch')
                expectBuffToBeEqual(Buffer.concat(addLT(data)), corpus.expectations.noOptions)
                done()
            })
        }

        it('with target file path', function (done) {
            test(corpus.path, done)
        })
    
        it('with file descriptor', function (done) {
            test(corpus.fd, done)
        })
    
        it('with stream', function (done) {
            test(corpus.rs, done)
        })
    })

    describe('should tail file last N bytes', function () {
        function test (target, done) {
            // Get content length in bytes
            const contentByteLength = Buffer.byteLength(corpus.expectations.content, 'utf8')

            // Pick a random byte
            const bytes = randomInt(1000)
            const buff = Buffer.alloc(bytes)
            
            // Read file last N bytes
            fs.readSync(corpus.fd, buff, {
                position: contentByteLength - bytes
            })

            const data = []
    
            new Tail(target, {
                bytes
            }).on('data', (line) => {
                data.push(line)
            }).on('end', () => {
                expect(data[0]).to.be.instanceof(Buffer, 'Expected data to be an instance of Buffer')
                expectBuffToBeEqual(Buffer.concat(addLT(data)), buff)
                done()
            })
        }

        it('with target file path', function (done) {
            test(corpus.path, done)
        })
    
        it('with file descriptor', function (done) {
            test(corpus.fd, done)
        })
    
        it('with stream', function (done) {
            test(corpus.rs, done)
        })
    })

    describe('should tail file from Nth byte', function () {
        function test (target, done) {
            // Get content length in bytes
            const contentByteLength = Buffer.byteLength(corpus.expectations.content, 'utf8')

            // Pick a random starting byte in last 5000 bytes of content
            const startAtByte = randomInt(contentByteLength - 5000)
            const buff = Buffer.alloc(contentByteLength - startAtByte)
            
            // Read file from picked byte
            fs.readSync(corpus.fd, buff, {
                position: startAtByte
            })

            const data = []
    
            new Tail(target, {
                bytes: `+${startAtByte}`
            }).on('data', (line) => {
                data.push(line)
            }).on('end', () => {
                expect(data[0]).to.be.instanceof(Buffer, 'Expected data to be an instance of Buffer')
                expectBuffToBeEqual(Buffer.concat(addLT(data)), buff)
                done()
            })
        }

        it('with target file path', function (done) {
            test(corpus.path, done)
        })
    
        it('with file descriptor', function (done) {
            test(corpus.fd, done)
        })
    
        it('with stream', function (done) {
            test(corpus.rs, done)
        })
    })

    describe('should tail file last N lines', function () {
        function test (target, done) {
            // Get content length in bytes
            const contentByteLength = Buffer.byteLength(corpus.expectations.content, 'utf8')

            // Get content lines count
            const contentLines = corpus.expectations.content.toString('utf8').split(/\r\n/)

            // Pick a random line
            const lines = randomInt(50)

            // Get last N lines content length in bytes (N being picked random line; adding line terminators to each line picked)
            const linesByteLength = Buffer.byteLength(contentLines.slice(-lines).join('\r\n'))
            const buff = Buffer.allocUnsafe(linesByteLength)
            
            // Read file from last N lines byte length
            fs.readSync(corpus.fd, buff, {
                position: contentByteLength - linesByteLength
            })

            const data = []
    
            new Tail(target, {
                lines
            }).on('data', (line) => {
                data.push(line)
            }).on('end', () => {
                expect(data[0]).to.be.instanceof(Buffer, 'Expected data to be an instance of Buffer')
                expect(data).to.have.lengthOf(lines, 'Lines count mismatch')
                expectBuffToBeEqual(Buffer.concat(addLT(data)), buff)
                done()
            })
        }

        it('with target file path', function (done) {
            test(corpus.path, done)
        })
    
        it('with file descriptor', function (done) {
            test(corpus.fd, done)
        })
    
        it('with stream', function (done) {
            test(corpus.rs, done)
        })
    })

    describe('should tail file from Nth line', function () {
        function test (target, done) {
            // Get content length in bytes
            const contentByteLength = Buffer.byteLength(corpus.expectations.content, 'utf8')

            // Get content lines count
            const contentLines = corpus.expectations.content.toString('utf8').split(/\r\n/)

            // Pick a random starting line in last 100 lines
            const lines = randomInt(contentLines.length - 100)

            // Get picked lines content length in bytes (N being picked random starting line; adding line terminators to each line picked)
            const linesByteLength = Buffer.byteLength(contentLines.slice(lines).join('\r\n'))
            const buff = Buffer.allocUnsafe(linesByteLength)
            
            fs.readSync(corpus.fd, buff, {
                position: contentByteLength - linesByteLength
            })

            const data = []
    
            new Tail(target, {
                lines: `+${lines}`
            }).on('data', (line) => {
                data.push(line)
            }).on('end', () => {
                expect(data[0]).to.be.instanceof(Buffer, 'Expected data to be an instance of Buffer')
                expect(data).to.have.lengthOf(contentLines.length - lines, 'Lines count mismatch')
                expectBuffToBeEqual(Buffer.concat(addLT(data)), buff)
                done()
            })
        }

        it('with target file path', function (done) {
            test(corpus.path, done)
        })
    
        it('with file descriptor', function (done) {
            test(corpus.fd, done)
        })
    
        it('with stream', function (done) {
            test(corpus.rs, done)
        })
    })

    describe('follow mode', function () {
        it('should follow data quickly appended to file (backpressure)', function (done) {
            const rndStrSize = randomInt()
    
            this.slow(rndStrSize * 2)
            this.timeout(rndStrSize * 3)

            const expectedLogPath = getExpectedLogPath()
            const receivedLogPath = getReceivedLogPath()
    
            fs.writeFileSync(expectedLogPath, '')
            fs.writeFileSync(receivedLogPath, '')
            
            const tail = new Tail(expectedLogPath, {
                follow: true
            }).on('data', (chunk) => {
                const data = chunk.toString('utf8')
    
                fs.appendFileSync(receivedLogPath, `${data}\n`)
            })
    
            for (let i = 0; i < rndStrSize; i++) {
              fs.appendFile(expectedLogPath, `${randomString(50)}\n`, () => {})
            }

            tail.on('end', () => {
                tail.unfollow()

                const bufferContent = fs.readFileSync(expectedLogPath, 'utf8')
                const outputContent = fs.readFileSync(receivedLogPath, 'utf8')
        
                expect(outputContent).to.equal(bufferContent)
    
                if (!DEB_BUFF) {
                    fs.unlinkSync(expectedLogPath)
                    fs.unlinkSync(receivedLogPath)
                }
                
                done()
            })
        })
    })

    describe('errors', function () {
        it('should fail to tail invalid file', function (done) {
            new Tail(path.resolve(__dirname, `${randomString(10)}.txt`)).on('error', (err) => {
                expect(err).to.be.instanceof(Error)
                done()
            })
        })

        it('should fail to tail invalid file descriptor', function (done) {
            new Tail(654).on('error', (err) => {
                expect(err).to.be.instanceof(Error)
                done()
            })
        })
    })
})