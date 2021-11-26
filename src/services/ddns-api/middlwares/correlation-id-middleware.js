'use strict'
const { v4: uuid } = require('uuid')

module.exports = (logger) => async function (req, res, next) {
    req.correlationId = uuid()
    logger.info({ message: `New request. URL: ${req.originalUrl}`, cid: req.correlationId })
    next()
}