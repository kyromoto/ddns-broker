'use strict'

require('dotenv').config()

const awilix = require('awilix')

// shared
const LoggerFactory = require('./shared/logger')
const ConfigRepository = require('./shared/config-repository')
const MessageQueue = require('./shared/message-queue')

// services
const DDNS_API = require('./services/ddns-api')
const InwxProvider = require('./services/providers/inwx')
const GoDaddyProvider = require('./services/providers/godaddy')


const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.CLASSIC
})

container.register({
    loggerFactory: awilix.asClass(LoggerFactory),
    messageQueue: awilix.asClass(MessageQueue),
    configRepository: awilix.asClass(ConfigRepository),
    api: awilix.asClass(DDNS_API),
    inwx: awilix.asClass(InwxProvider),
    godaddy: awilix.asClass(GoDaddyProvider)
})

container.resolve('inwx')
container.resolve('godaddy')
container.resolve('api').start()