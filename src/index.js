'use strict'

require('dotenv').config()

const Logger = require('./logger')
const ConfigRepository = require('./services/config-repository')
const DDNS_API = require('./services/ddns-api')
const MessageQueue = require('./services/message-queue')
const InwxProvider = require('./services/providers/inwx')
// const GoDaddyProvider = require('./services/providers/godaddy')

const configRepository = new ConfigRepository(Logger.getServiceLogger('Config Repository'))
const messageQueue = new MessageQueue(Logger.getServiceLogger('Message Queue'))
const api = new DDNS_API(Logger.getServiceLogger('DDNS API'), configRepository, messageQueue)
const inwx = new InwxProvider(Logger.getServiceLogger('INWX Provider'), messageQueue)
// const godaddy = new GoDaddyProvider(Logger.getServiceLogger('GoDaddy Provider'), messageQueue)

api.start()