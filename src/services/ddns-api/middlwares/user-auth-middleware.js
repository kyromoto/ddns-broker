'use strict'
const auth = require('basic-auth')

module.exports = (logger, configRepository) => async function (req, res, next) {
    try {
        const credentials = auth(req)

        if(!credentials || !credentials.name || !credentials.pass) {
            logger.warn({ message: `Credentials are missing. Credentials ${credentials}`, cid: req.correlationId })
            return res.status(401).send('badauth')
        }

        const isAuthorized = await configRepository.authentifiziereBenutzer(credentials.name, credentials.pass)

        if(!isAuthorized) {
            logger.warn({ message: `User not found. User: ${credentials.name}`, cid: req.correlationId })
            return res.status(401).send('badauth')
        }

        req.username = credentials.name

        logger.info({ message: `User is authorized. User: ${credentials.name}`, cid: req.correlationId })

        return next()
    } catch (err) {
        logger.error({ message: err.message, cid: req.correlationId })
        return res.status(500).send('fatal')
    }
}