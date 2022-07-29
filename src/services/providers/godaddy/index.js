const { init } = require('express/lib/application')
const needle = require('needle')
const libFQDN = require('./../../../libs/fqdn')

const API_FQDN = process.env.NODE_ENV === 'production' ? 'api.godaddy.com' : 'api.ote-godaddy.com'

class Provider {
    constructor(loggerFactory, messageQueue) {
        this.logger = loggerFactory.createServiceLogger('GoDaddy Provider')
        this.messageQueue = messageQueue

        this.logger.info(`use ${API_FQDN}`)
    }

    init() {
        this.messageQueue.registerQueue('godaddy', 1, async (job, callback) => {
            const { correlationId, fqdn, ips, action} = job

            ips.forEach(ip => {
                const ipType = libFQDN.getIpType(ip)
                const provider = { name: action.provider, auth: action.auth }
                const payload = { correlationId: correlationId, provider: provider, fqdn: fqdn, ip: ip }
                this.messageQueue.emit('message', { queue: "godaddy_exec", payload: payload })

                this.logger.info({ message: `Job emitted for record ${ipType} of ${fqdn}`, cid: req.correlationId, fqdn: fqdn, ipType: ipType })
            })

            return callback(undefined, 'OK')
        })
        
        this.messageQueue.registerQueue('godaddy_exec', 1, async (job, callback) => {
            const correlationId = job.correlationId
            const key = job.provider.auth.key
            const secret = job.provider.auth.secret
            const fqdn = job.fqdn
            const domain = libFQDN.getDomain(fqdn)
            const hostname = libFQDN.getHostname(fqdn)
            const ip = job.ip
            const ipType = libFQDN.getIpType(ip)

            const requestUrl = `https://${API_FQDN}/v1/domains/${domain}/records/${ipType}/${hostname.length > 0 ? hostname : '@'}`
            const data = [{ data: ip }]
            const options = { headers : { 'Authorization': `sso-key ${key}:${secret}`, 'accept': 'application/json', 'Content-Type': 'application/json' }}

            this.logger.debug({ message: `Try \nPUT ${requestUrl}\noptions: ${JSON.stringify(options)}\ndata: ${JSON.stringify(data)}` })

            needle.put(requestUrl, data, options, (err, res) => {
                if(err) {
                    this.logger.error({ message: `DNS record update failed. Error: ${err.message}`,fqdn: fqdn, ipType: ipType, cid: correlationId })
                    return callback(new Error("ERROR"))
                }

                if(res.statusCode !== 200) {
                    this.logger.error({ message: `DNS record update failed. Error: ${res.body.message}`, fqdn: fqdn, ipType: ipType, cid: correlationId })
                    return callback(new Error("ERROR"))
                }

                this.logger.info({ message: `DNS record update done.`, fqdn: fqdn, ipType: ipType, cid: correlationId })

                return callback(undefined, 'OK')
            })
        })
    }
}

module.exports = Provider