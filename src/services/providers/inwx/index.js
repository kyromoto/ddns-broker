'use strict'

const { ApiClient, Language } = require('domrobot-client')
const  Validator = require('validator')
const libFQDN = require('./../../../libs/fqdn')

const API_URL = process.env.NODE_ENV === 'production' ? ApiClient.API_URL_LIVE : ApiClient.API_URL_OTE

const login = async function (client, username, password) {
    const loginResponse = await client.login(username, password)

    if (loginResponse.code !== 1000) {
        throw new Error("INWX api login error. " + getErrorMessageFromApiResponse(loginResponse));
    }
}

const logout = async function (client) {
    await client.logout()
}

const getErrorMessageFromApiResponse = function (response) {
    return `Code: ${response.code}  Message: ${response.msg}`
}

class Provider {
    constructor(loggerFactory, messageQueue) {     
        this.client = new ApiClient(API_URL, Language.DE, process.env.NODE_ENV !== 'production')
        this.logger = loggerFactory.createServiceLogger('GoDaddy Provider')

        this.logger.info(`use ${API_URL}`)

        messageQueue.registerQueue('inwx', 1, async (job, callback) => {
            const correlationId = job.correlationId
            const username = job.provider.auth.username
            const password = job.provider.auth.password
            const fqdn = job.fqdn
            const domain = libFQDN.getDomain(fqdn)
            // const hostname = libFQDN.getHostname(fqdn)
            const ip = job.ip
            const ipType = libFQDN.getIpType(ip)

            try {
                await login(this.client, username, password)
                this.logger.debug({ message: `INWX api login successfull for ${username}.`, fqdn: fqdn, ipType: ipType, cid: correlationId })
        
                const nameserverInfoResponse = await this.client.callApi('nameserver.info', { domain: domain, name: fqdn }, correlationId)
        
                if (nameserverInfoResponse.code !== 1000) {
                    throw new Error("INWX api nameserver.info request error. " + getErrorMessageFromApiResponse(nameserverInfoResponse));
                }
        
                if(!nameserverInfoResponse || !nameserverInfoResponse.resData.record) {
                    throw new Error(`No records found for hostmane in domain. DOMAIN: ${domain} FQDN: ${fqdn}`)
                }
        
                const records = nameserverInfoResponse.resData.record
        
                if(records.length <= 0) {
                    throw new Error(`INWX api no records found error for ${ipType} of ${fqdn}.`)
                }
        
                const recordsfilteredByType = records.filter(record => record.type === ipType)
        
                if(recordsfilteredByType.length <= 0) {
                    throw new Error(`INWX api no ipv4 records found error for ${ipType} of ${fqdn}.`)
                }
        
                const domainUpdateResponse = await this.client.callApi('nameserver.updateRecord', { id: recordsfilteredByType[0].id, content: ip }, correlationId)
        
                if(domainUpdateResponse.code !== 1000) {
                    throw new Error(`INWX api nameserver.updateRecord error ffor ${ipType} of ${fqdn}. ${getErrorMessageFromApiResponse(domainUpdateResponse)}`)
                }
        
                this.logger.info({ message: `DNS record update successfull for ${ipType} of ${fqdn}. Code: ${domainUpdateResponse.code}  Message: ${domainUpdateResponse.msg}`, fqdn: fqdn, ipType: ipType, cid: correlationId })
        
                await logout(this.client)
                this.logger.debug({ message: `INWX api logout successfull.`, fqdn: fqdn, ipType: ipType, cid: correlationId })

                return callback(undefined, 'OK')
            } catch (err) {
                this.logger.error({ message: err.message, fqdn: fqdn, ipType: ipType, cid: correlationId })
                return callback(new Error("ERROR"))
            }
        })
    }
}

module.exports = Provider