'use strict'

const Validator = require('validator')

module.exports = (logger, configRepository, messageQueue) => async function (req, res) {
    try {
        const ipv4 = req.query.ip
        const ipv6 = req.query.ipv6
        const hostname = req.query.hostname

        if(typeof ipv4 === 'undefined' && typeof ipv6 === 'undefined') {
            logger.warn({ message: `BAD request: ipv4 nor ipv6 are not defined. URL: ${req.originalUrl}`, cid: req.correlationId })
            return res.status(400).send('fatal')
        }

        if(!hostname) {
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

        if(!Validator.isFQDN(hostname)) {
            logger.warn({ message: `BAD request: Hostname is not valid. HOSTNAME: ${hostname}`, cid: req.correlationId })
            return res.status(400).send('fatal')
        }

        if(!req.username) {
            logger.warn({ message: `BAD request: Username is undefined.`, cid: req.correlationId })
            return res.status(400).send('fatal')
        }

        const provider = await configRepository.getProviderByUsernameAndHostname(req.username, hostname)

        if(typeof ipv4 !== 'undefined') {
            const payload = { correlationId: req.correlationId, provider: provider, hostname: hostname, ip: ipv4 }
            messageQueue.emit('message', { queue: provider.name, payload: payload })

            logger.info({ message: `Job emitted for IPv4. URL: ${req.originalUrl}`, cid: req.correlationId })
        }

        if(typeof ipv6 !== 'undefined') {
            const payload = { correlationId: req.correlationId, provider: provider, hostname: hostname, ip: ipv6 }
            messageQueue.emit('message', { queue: provider.name, payload: payload })

            logger.info({ message: `Job emitted for IPv6. URL: ${req.originalUrl}`, cid: req.correlationId })
        }

        return res.status(200).send('good')
    } catch (err) {
        logger.error({ message: `req error. URL: ${req.originalUrl} ERROR: ${err.message}`, cid: req.correlationId })
        return res.status(500).send('fatal')
    }
}