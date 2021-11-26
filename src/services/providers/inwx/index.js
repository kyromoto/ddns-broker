'use strict'

const { ApiClient, Language } = require('domrobot-client')
const  Validator = require('validator')

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

const getDomain = function (hostname) {
    let splittedHostname = hostname.split('.');
  
    if (splittedHostname.length < 2) {
        throw new Error(`Hostname could not be splitted. Hostname: ${hostname}`)
    }
  
    return splittedHostname[splittedHostname.length - 2] + '.' + splittedHostname[splittedHostname.length - 1];
}

const getIpType = function (ip) {    
    if(Validator.isIP(ip, 4)) {
        return "A"
    }
    
    if (Validator.isIP(ip, 6)) {
        return "AAAA"
    }

    throw new Error(`Ip is not valid. ${ip}`)
}

const getErrorMessageFromApiResponse = function (response) {
    return `Code: ${response.code}  Message: ${response.msg}`
}

class Provider {
    constructor(logger, messageQueue) {     
        this.client = new ApiClient(API_URL, Language.DE, process.env.NODE_ENV !== 'production')
        this.logger = logger

        this.logger.info(`use ${API_URL}`)

        messageQueue.registerQueue('inwx', 1, async (job, callback) => {
            const correlationId = job.correlationId
            const username = job.provider.auth.username
            const password = job.provider.auth.password
            const hostname = job.hostname
            const ip = job.ip

            try {
                if(!Validator.isFQDN(hostname)) {
                    throw new Error(`Hostname is not valid. Hostname: ${hostname}`)
                }
        
                const ipType = getIpType(ip)
                const domain = getDomain(hostname)
        
                await login(this.client, username, password)
                this.logger.debug(`INWX api login successfull for ${username}.`, correlationId)
        
                const nameserverInfoResponse = await this.client.callApi('nameserver.info', { domain: domain, name: hostname }, correlationId)
        
                if (nameserverInfoResponse.code !== 1000) {
                    throw new Error("INWX api nameserver.info request error. " + getErrorMessageFromApiResponse(nameserverInfoResponse));
                }
        
                if(!nameserverInfoResponse || !nameserverInfoResponse.resData.record) {
                    throw new Error(`No records found for hostmane in domain. DOMAIN: ${domain} HOSTNAME: ${hostname}`)
                }
        
                const records = nameserverInfoResponse.resData.record
        
                if(records.length <= 0) {
                    throw new Error(`INWX api no records found error for ${hostname}.`)
                }
        
                const recordsfilteredByType = records.filter(record => record.type === ipType)
        
                if(recordsfilteredByType.length <= 0) {
                    throw new Error(`INWX api no ipv4 records found error for ${hostname}.`)
                }
        
                const domainUpdateResponse = await this.client.callApi('nameserver.updateRecord', { id: recordsfilteredByType[0].id, content: ip }, correlationId)
        
                if(domainUpdateResponse.code !== 1000) {
                    throw new Error(`INWX api nameserver.updateRecord error for ${hostname}. ${getErrorMessageFromApiResponse(domainUpdateResponse)}`)
                }
        
                this.logger.info({ message: `Dns records update successfull for ${hostname}. Code: ${domainUpdateResponse.code}  Message: ${domainUpdateResponse.msg}`, cid: correlationId })
        
                await logout(this.client)
                this.logger.debug({ message: `INWX api logout successfull.`, cid: correlationId })

                return callback(undefined, 'OK')
            } catch (err) {
                // this.logger.error(err.message, correlationId)
                return callback(new Error(`DNS Update failed. Error: ${err.message}`))
            }
        })
    }
}

module.exports = Provider