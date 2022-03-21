'use strict'
const http = require('http')
const express = require('express')
const helmet = require('helmet')
const userAuthMiddleware = require('./middlwares/user-auth-middleware')
const correlationIdMiddleware = require('./middlwares/correlation-id-middleware')
const routeNotFoundMiddleware = require('./middlwares/route-not-found-middleware')
const updateHandler = require('./routes/update')
const statusHandler = require('./routes/status')

const HTTP_HOST = process.env.HTTP_HOST || '0.0.0.0'
const HTTP_PORT = process.env.HTTP_PORT || 3000

class DDNS_API {
    constructor(loggerFactory, configRepository, messageQueue) {
        this.logger = loggerFactory.createServiceLogger('DDNS API')
        this.configRepository = configRepository
        this.messageQueue = messageQueue
        
        this.app = express()
        this.server = http.createServer(this.app)

        this.app.use(helmet())
        this.app.get('/update', correlationIdMiddleware(this.logger), userAuthMiddleware(this.logger, this.configRepository), updateHandler(this.logger, this.configRepository, this.messageQueue))
        this.app.get('/status', statusHandler())
        this.app.use(routeNotFoundMiddleware(this.logger))
    }

    start() {
        this.server.listen(HTTP_PORT, HTTP_HOST, () => this.logger.info(`DDNS API is listen on ${HTTP_HOST}:${HTTP_PORT}`))
    }
}

module.exports = DDNS_API