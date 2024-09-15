import 'dotenv/config'

import pino from 'pino'
import pinoPretty from 'pino-pretty'
import { Router } from "express"


import { User } from './domains/ddns-gateway/entities/User'
import { Event } from './domains/ddns-gateway/entities/Event'
import { Client } from './domains/ddns-gateway/entities/Client'
import { Password } from './domains/ddns-gateway/entities/Password'



import * as env from './env'
import * as init from './init'
import * as Logger from "./logger"
import { AppDataSource } from './database'
import { makeApiServer } from './http-api'
import { makeEventBusService } from './event-bus'
import { makeProcessorRegistry } from './processor-registry'

import { makeUpdateClientIpCmdController } from './http-api/controllers/ddns-controllers'
import { makeAddClientCmdController, makeAddUserCmdController, makeLoginUserCommandController } from './http-api/controllers/command-controllers'
import { makeGetClientsQueryController, makeGetEventsQueryController, makeGetUsersQueryController, makeRefreshTokenQueryController } from './http-api/controllers/query-controllers'
import { makeAuthenticateClientMiddleware } from './http-api/middlewares/authenticate-client-mw'

import { AppError } from './domains/_errors/AppError'

import { makeAddUserCommand } from './domains/ddns-gateway/usecases/add-user'
import { makeAddClientCommand } from './domains/ddns-gateway/usecases/add-client'
import { makeUpdateClientIpExecutor } from './domains/ddns-gateway/usecases/update-client-ip'
import { makeIsClientAuthenticatedQuery } from './domains/ddns-gateway/usecases/is-client-authenticated'

import { makeProcessProcessorJobUC } from './domains/dynip-update-processing/usecases/process-processor-job'
import { makeCreateProcessJobUpdateUC } from './domains/dynip-update-processing/usecases/create-processor-job'

import { makeGetUsersQuery } from './domains/ddns-gateway/usecases/get-users'
import { makeGetEventsByUserIdQuery } from './domains/ddns-gateway/usecases/get-events-by-userid'
import { makeGetClientsByUserIdQuery } from './domains/ddns-gateway/usecases/get-clients-by-userid'
import { makeLoginUserCommand } from './domains/ddns-gateway/usecases/login-user'
import { makeRefreshUserTokensQuery } from './domains/ddns-gateway/usecases/refresh-user-token'
import { makeAuthenticateUserMiddleware } from './http-api/middlewares/authenticate-user-mw'
import { makeGetUserIdFromAccessToken } from './domains/ddns-gateway/usecases/get-userid-from-accesstoken'






(async () => {

    const logger = pino(Logger.loggerOptions, pinoPretty({ colorize: true }))

    !AppDataSource.isInitialized && await AppDataSource.initialize()

    const userRepository        = AppDataSource.getRepository(User)
    const clientRepository      = AppDataSource.getRepository(Client)
    const passwordRepository    = AppDataSource.getRepository(Password)
    const eventRepository       = AppDataSource.getRepository(Event)


    const eventBusService = makeEventBusService(logger)
    const processorRegistry = makeProcessorRegistry()

    // commands
    const addUserUC                 = makeAddUserCommand(logger, userRepository, passwordRepository, eventBusService)
    const addClientUC               = makeAddClientCommand(logger, clientRepository, passwordRepository, eventBusService)
    const updateClientIpUC          = makeUpdateClientIpExecutor(logger, clientRepository, eventBusService)
    const isClientAuthenticatedUC   = makeIsClientAuthenticatedQuery(logger, clientRepository)

    const loginUserCmd             = makeLoginUserCommand(logger, userRepository, { access: env.ACCESS_TOKEN_SECRET, refresh: env.REFRESH_TOKEN_SECRET })
    const createProcessorJobUC     = makeCreateProcessJobUpdateUC(AppDataSource.manager, eventBusService, logger)
    const processProcessorJobUC    = makeProcessProcessorJobUC(AppDataSource.manager, processorRegistry, logger)


    // queries
    const getUsersQuery             = makeGetUsersQuery(logger, userRepository)
    const getClientsByUserIdQuery   = makeGetClientsByUserIdQuery(logger, userRepository)
    const getEventsByUserIdQuery    = makeGetEventsByUserIdQuery(logger, eventRepository)
    const getUserIdFromAccessToken  = makeGetUserIdFromAccessToken(env.ACCESS_TOKEN_SECRET)
    const refreshUserTokensQuery    = makeRefreshUserTokensQuery(logger, userRepository, { access: env.ACCESS_TOKEN_SECRET, refresh: env.REFRESH_TOKEN_SECRET })


    // http middleware
    const authClientMiddleware  = makeAuthenticateClientMiddleware(isClientAuthenticatedUC, clientRepository)
    const authUserMiddleware    = makeAuthenticateUserMiddleware(getUserIdFromAccessToken)


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



    ddnsGwCommandRouter.post("/add-user",   authUserMiddleware, makeAddUserCmdController(addUserUC))
    ddnsGwCommandRouter.post("/add-client", authUserMiddleware, makeAddClientCmdController(addClientUC))
    ddnsGwCommandRouter.post("/login-user", makeLoginUserCommandController(loginUserCmd))

    // ddnsGwQueryRouter.get("/ping", makePingQueryController())
    ddnsGwQueryRouter.get("/refresh-user-tokens",   makeRefreshTokenQueryController(refreshUserTokensQuery))
    ddnsGwQueryRouter.get("/get-users",             authUserMiddleware, makeGetUsersQueryController(getUsersQuery))
    ddnsGwQueryRouter.get("/get-clients-by-user",   authUserMiddleware, makeGetClientsQueryController(getClientsByUserIdQuery))
    ddnsGwQueryRouter.get("/get-events-by-user",    authUserMiddleware, makeGetEventsQueryController(getEventsByUserIdQuery))


    ddnsGwClientUpdateRouter.post("/update", authClientMiddleware, makeUpdateClientIpCmdController(updateClientIpUC))
    ddnsGwClientUpdateRouter.get("/update",  authClientMiddleware, makeUpdateClientIpCmdController(updateClientIpUC))
    
    
    apiRouter.use("/api/ddns-gw/cmd",   ddnsGwCommandRouter)
    apiRouter.use("/api/ddns-gw/query", ddnsGwQueryRouter)
    apiRouter.use("/ddns-gw/ddns",      ddnsGwClientUpdateRouter)


    await init.createRootUser(logger, userRepository)


    makeApiServer(logger, apiRouter).listen(env.HTTP_PORT, env.HTTP_BIND, () => logger.info(`api listening on http://${env.HTTP_BIND}:${env.HTTP_PORT}`))
    
})()