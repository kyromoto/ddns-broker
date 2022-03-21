'use strict'

const winston = require('winston')

const LOG_LEVEL = process.env.LOG_LEVEL || 'info'

const BASE_LOGGER_CONFIG = {
    level: LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
    ),
    transports: [new winston.transports.Console()]
}

class LoggerFactory {
    logger = winston.createLogger(BASE_LOGGER_CONFIG)

    createServiceLogger (serviceName) {
        return this.logger.child({ defaultMeta: { service: serviceName }})
    }
}

module.exports = LoggerFactory