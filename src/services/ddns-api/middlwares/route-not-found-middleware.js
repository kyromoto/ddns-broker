'use strict'

const uuid = require('uuid')

module.exports = (logger) => function (req, res, next) {
    logger.warn({ message: `Route not found. URL: ${req.originalUrl}`, cid: req.correlationId })
    res.status(404).send('not found')
}