import 'dotenv/config'

import { EventEmitter } from 'node:events'

import pino from 'pino'
import pinoPretty from 'pino-pretty'
import { Router } from "express"



import { AppDataSource } from './database'
import { User } from './domains/ddns-gateway/models/User'
import { Password } from './domains/ddns-gateway/models/Password'
import { Client } from './domains/ddns-gateway/models/Client'

import * as env from './env'
import * as Logger from "./logger"
import { makeAddClientCmdController, makeAddUserCmdController } from './http-api/controllers/command-http-controllers'
import { makeApiServer } from './http-api'
import { makeEventBusService } from './event-bus'
import { makePingQueryController } from './http-api/controllers/query-http-controllers'
import { makeUpdateClientIpCmdController } from './http-api/controllers/ddns-http-controllers'
import { makeAuthenticateClientMiddleware } from './http-api/middlewares/authenticate-client-mw'
import { makeAddUserCommand } from './domains/ddns-gateway/usecases/add-user'
import { makeAddClientCommand } from './domains/ddns-gateway/usecases/add-client'
import { makeUpdateClientIpExecutor } from './domains/ddns-gateway/usecases/update-client-ip'
import { makeIsClientAuthenticatedQuery } from './domains/ddns-gateway/usecases/is-client-authenticated'
import { makeCreateProcessJobUpdateUC } from './domains/ip-update-processor/usecases/create-processor-job'
import { makeProcessProcessorJobUC } from './domains/ip-update-processor/usecases/process-processor-job'
import { AppError } from './domains/_errors/AppError'
import { makeProcessorRegistry } from './processor-registry'





(async () => {

    const logger = pino(Logger.loggerOptions, pinoPretty({ colorize: true }))

    !AppDataSource.isInitialized && await AppDataSource.initialize()

    const userRepository        = AppDataSource.getRepository(User)
    const clientRepository      = AppDataSource.getRepository(Client)
    const passwordRepository    = AppDataSource.getRepository(Password)


    const eventBusService = makeEventBusService(logger)
    const processorRegistry = makeProcessorRegistry()

    // usecases
    const addUserUC                 = makeAddUserCommand(logger, userRepository, passwordRepository, eventBusService)
    const addClientUC               = makeAddClientCommand(logger, clientRepository, passwordRepository, eventBusService)
    const updateClientIpUC          = makeUpdateClientIpExecutor(logger, clientRepository, eventBusService)
    const isClientAuthenticatedUC   = makeIsClientAuthenticatedQuery(logger, clientRepository)

    const createProcessorJobUC     = makeCreateProcessJobUpdateUC(AppDataSource.manager, eventBusService, logger)
    const processProcessorJobUC    = makeProcessProcessorJobUC(AppDataSource.manager, processorRegistry, logger)


    eventBusService.subscribe("client-ip-updated", async event => {

        if (Array.isArray(event) || event.name !== "client-ip-updated") {
            throw new AppError(500, `event payload do not match subscribed event name client-ip-updated`)
        }

        await createProcessorJobUC(event.data.clientId, event.data.ips, event.cid)
    })


    eventBusService.subscribe("job-pending", async event => {
        
        if (event.name !== "job-pending") {
            throw new AppError(500, `event payload do not match subscribed event name job-pending`)
        }
        
        await processProcessorJobUC(event.data.jobId, event.cid)
    })


    const apiRouter                 = Router()
    const ddnsGwCommandRouter       = Router()
    const ddnsGwQueryRouter         = Router()
    const ddnsGwClientUpdateRouter  = Router()



    ddnsGwCommandRouter.post("/add-user",   makeAddUserCmdController(addUserUC))
    ddnsGwCommandRouter.post("/add-client", makeAddClientCmdController(addClientUC))

    ddnsGwQueryRouter.get("/ping", makePingQueryController())

    ddnsGwClientUpdateRouter.post("/update", makeUpdateClientIpCmdController(updateClientIpUC))
    ddnsGwClientUpdateRouter.get("/update",  makeUpdateClientIpCmdController(updateClientIpUC))
    
    apiRouter.use("/api/ddns-gw/cmd",   ddnsGwCommandRouter)
    apiRouter.use("/api/ddns-gw/query", ddnsGwQueryRouter)
    apiRouter.use("/ddns-gw/ddns",      makeAuthenticateClientMiddleware(isClientAuthenticatedUC, clientRepository), ddnsGwClientUpdateRouter)



    makeApiServer(apiRouter).listen(env.HTTP_PORT, env.HTTP_BIND, () => logger.info(`api listening on http://${env.HTTP_BIND}:${env.HTTP_PORT}`))
    
})()