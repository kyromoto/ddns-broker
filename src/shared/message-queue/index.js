'use strict'
const EventEmitter = require('events')
const queue = require('fastq')

class MessageQueue extends EventEmitter {
    constructor(loggerFactory) {
        super()
        this.logger = loggerFactory.createServiceLogger('Message Queue')
        this.queues = new Map()

        this.on('message', message => {
            if(!this.queues.has(message.queue)) {
                throw new Error(`No queue ${message.queue} registered.`)
            }

            const queue = this.queues.get(message.queue)
            
            queue.push(message.payload, (err, result) => {
                if(err) {
                    return this.logger.error({ message: 'Job failed: ' + err.message, cid: message.payload.correlationId })
                }

                this.logger.info({ message: 'Job result: ' + result, cid: message.payload.correlationId })
            })
        })
    }

    registerQueue(name, concurrent, worker) {
        if(this.queues.has(name)) {
            throw new Error(`Queue ${name} already registered.`)
        }

        this.queues.set(name, queue(worker, concurrent))
        this.logger.debug(`Queue ${name} registered.`)
    }

    getRegisteredQueueNames() {
        return [...this.queues.keys()]
    }
}

module.exports = MessageQueue