'use strict'

const path = require('path')
const fs   = require('fs/promises');
const yaml = require('js-yaml');

const filename = path.resolve(process.env.CONFIG_FILE || 'config.yaml')

const loadConfigFromFile = async function(filename) {
    try {
        const filecontent = await fs.readFile(filename)
        const config = yaml.load(filecontent)
        return config
    } catch (err) {
        throw new Error('Error while reading config file: ', err.message)
    }
}

const findAccountByUsername = function (config, username) {
    return config.accounts.find(account => account.username === username)
}

const getProviderByHostname = function (account, hostname) {
    return (account.hostnames.find(accountHostname => accountHostname.name === hostname)).provider
}

class ConfigRepository {
    constructor(loggerFactory) {
        this.logger = loggerFactory.createServiceLogger('Config Repository')
    }
    
    async getProviderByUsernameAndHostname(username, hostname) {
        try {
            const config = await loadConfigFromFile(filename)
            const account = findAccountByUsername(config, username)
            const provider = getProviderByHostname(account, hostname)

            return provider
        } catch(err) {
            this.logger.error('Error while getting hostname provider: ', err.message)
        }
    }

    async authentifiziereBenutzer(username, password) {
        try {
            const config = await loadConfigFromFile(filename)
            const account = findAccountByUsername(config, username)

            return account.password === password
        } catch (err) {
            this.logger.error('Error while authenticate user: ', err.message)
        }
    }
}

module.exports = ConfigRepository