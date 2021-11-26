'use strict'

const winston = require('winston')

const LOG_LEVEL = process.env.LOG_LEVEL || 'info'

const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
    ),
    transports: [new winston.transports.Console()]
})

const getServiceLogger = function (serviceName)  {
    return logger.child({ defaultMeta: { service: serviceName }})
}

module.exports = {
    getServiceLogger : getServiceLogger,
}