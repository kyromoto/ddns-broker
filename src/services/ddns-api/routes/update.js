'use strict'

const libFQDN = require('./../../../libs/fqdn')
const Validator = require('validator')

module.exports = (logger, configRepository, messageQueue) => async function (req, res) {
    try {
        const ipv4 = req.query.ip
        const ipv6 = req.query.ipv6
        const fqdn = req.query.hostname

        if(typeof ipv4 === 'undefined' && typeof ipv6 === 'undefined') {
            logger.warn({ message: `BAD request: ipv4 nor ipv6 are not defined. URL: ${req.originalUrl}`, cid: req.correlationId })
            return res.status(400).send('fatal')
        }

        if(!fqdn) {
            logger.warn({ message: `BAD request: hostname is not defined. URL: ${req.originalUrl}`, cid: req.correlationId })
            return res.status(400).send('fatal')
        }

        if(typeof ipv4 !== 'undefined') {
            if(!Validator.isIP(ipv4)) {
                logger.warn({ message: `BAD request: IPv4 is not valiid. IP: ${ipv4}`, cid: req.correlationId })
                return res.status(400).send('fatal')
            }
        }

        if(typeof ipv6 !== 'undefined') {
            if(!Validator.isIP(ipv6)) {
                logger.warn({ message: `BAD request: IPv6 is not valiid. IP: ${ipv6}`, cid: req.correlationId })
                return res.status(400).send('fatal')
            }
        }

        if(!Validator.isFQDN(fqdn)) {
            logger.warn({ message: `BAD request: Hostname is not valid. HOSTNAME: ${fqdn}`, cid: req.correlationId })
            return res.status(400).send('fatal')
        }

        if(!req.username) {
            logger.warn({ message: `BAD request: Username is undefined.`, cid: req.correlationId })
            return res.status(400).send('fatal')
        }

        // const provider = await configRepository.getProviderByUsernameAndHostname(req.username, fqdn)
        const actions = await configRepository.getActionsByUsernameAndHostname(req.username, fqdn)

        console.log(JSON.stringify(actions))

        const ips = []

        if(typeof ipv4 !== 'undefined') {
            ips.push(ipv4)
        }

        if(typeof ipv6 !== 'undefined') {
            ips.push(ipv6)
        }

        actions.forEach(action => {
            const payload = { correlationId: req.correlationId, action: action, fqdn: fqdn, ips: ips }
            messageQueue.emit('message', { queue: action.provider, payload: payload })

            logger.info({ message: `Job emitted for action provider ${action.provider} of ${fqdn}`, cid: req.correlationId, fqdn: fqdn })
        })

        // ips.forEach(ip => {
        //     const ipType = libFQDN.getIpType(ip)
        //     const payload = { correlationId: req.correlationId, provider: provider, fqdn: fqdn, ip: ip }
        //     messageQueue.emit('message', { queue: provider.name, payload: payload })

        //     logger.info({ message: `Job emitted for record ${ipType} of ${fqdn}`, cid: req.correlationId, fqdn: fqdn, ipType: ipType })
        // })

        return res.status(200).send('good')
    } catch (err) {
        logger.error({ message: `req error. URL: ${req.originalUrl} ERROR: ${err.message}`, cid: req.correlationId })
        return res.status(500).send('fatal')
    }
}