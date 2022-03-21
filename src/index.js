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
    loggerFactory: awilix.asClass(LoggerFactory).setLifetime(awilix.Lifetime.SINGLETON),
    messageQueue: awilix.asClass(MessageQueue).setLifetime(awilix.Lifetime.SINGLETON),
    configRepository: awilix.asClass(ConfigRepository).setLifetime(awilix.Lifetime.SINGLETON),
    api: awilix.asClass(DDNS_API).setLifetime(awilix.Lifetime.SINGLETON),
    inwx: awilix.asClass(InwxProvider).setLifetime(awilix.Lifetime.SINGLETON),
    godaddy: awilix.asClass(GoDaddyProvider).setLifetime(awilix.Lifetime.SINGLETON)
})

container.resolve('inwx').init()
container.resolve('godaddy').init()
container.resolve('api').start()