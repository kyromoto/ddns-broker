import 'dotenv/config'

import pino from 'pino'
import pinoPretty from 'pino-pretty'
import { Router } from "express"


import * as env from './env'
import * as init from './init'
import * as Logger from "./logger"
import { AppDataSource, registerSchemas } from './database'
import { makeApiServer } from './http-api'
import { makeEventBusService } from './event-bus'
import { makeProcessorRegistry } from './processor-registry'

import EventBusSchemas from './event-bus/schemas'
import IamSchemas from './domains/iam/schemas'
import DynipUpdateReportingSchemas from './domains/dynip-update-reporting/schemas'
import DynipUpdateProcessingSchemas from './domains/dynip-update-processing/schemas'



import { AppError } from './domains/_errors/AppError'

import { makeGetUsersQuery } from './domains/iam/usecases/get-users'
import { makeAddUserCommand } from './domains/iam/usecases/add-user'
import { makeIsUserTokenValidQuery } from './domains/iam/usecases/is-user-token-valid'
import { makeGetUserAuthTokensQuery } from './domains/iam/usecases/get-user-auth-tokens'
import { makeIsClientAuthenticatedQuery } from './domains/dynip-update-reporting/usecases/is-client-credentials-valid'
import { makeIsUserCredentialsValidQuery } from './domains/iam/usecases/is-user-credentials-valid'

import { makeAddUserCmdController } from './http-api/controllers/iam-command.controller'
import { makeAuthenticateUserByTokenMiddleware } from './http-api/middlewares/authenticate-user-by-token.middleware'
import { makeAuthenticateUserByCredentialsMiddleware } from './http-api/middlewares/authenticate-user-by-credentials.middleware'
import { makeAuthenticateClientByCredentialsMiddleware } from './http-api/middlewares/authenticate-client-by-credentials.middleware'
import { makeGetUserAuthTokenQueryController, makeGetUsersQueryController } from './http-api/controllers/iam-query.controller'





(async () => {

    const logger = pino(Logger.loggerOptions, pinoPretty({ colorize: true }))

    registerSchemas([
        EventBusSchemas.Event,

        IamSchemas.UserSchema,
        IamSchemas.RoleSchema,

        DynipUpdateReportingSchemas.UserSchema,
        DynipUpdateReportingSchemas.ClientSchema,

        DynipUpdateProcessingSchemas.ProcessorSchema,
        DynipUpdateProcessingSchemas.JobSchema
    ])

    !AppDataSource.isInitialized && await AppDataSource.initialize()

    const eventBusService = makeEventBusService(logger, AppDataSource.manager)
    const processorRegistry = makeProcessorRegistry()

    // commands
    const addUserCommand = makeAddUserCommand(logger, AppDataSource.manager, eventBusService)


    // queries
    const isClientAuthenticatedQuery    = makeIsClientAuthenticatedQuery    (logger, AppDataSource.manager)
    const isUserCredentialsValidQuery   = makeIsUserCredentialsValidQuery   (logger, AppDataSource.manager)
    const isUserTokenValidQuery         = makeIsUserTokenValidQuery         (logger, AppDataSource.manager, { access: env.ACCESS_TOKEN_SECRET, refresh: env.REFRESH_TOKEN_SECRET })
    const getUserAuthTokensQuery        = makeGetUserAuthTokensQuery        (logger, AppDataSource.manager, { access: env.ACCESS_TOKEN_SECRET, refresh: env.REFRESH_TOKEN_SECRET })
    const getUsersQuery                 = makeGetUsersQuery                 (logger, AppDataSource.manager)


    // http middleware
    const authenticateUserByTokenMiddleware         = makeAuthenticateUserByTokenMiddleware         (AppDataSource.manager, isUserTokenValidQuery)
    const authenticateUserByCredentialsMiddleware   = makeAuthenticateUserByCredentialsMiddleware   (AppDataSource.manager, isUserCredentialsValidQuery)
    const authenticateClientByCredentialsMiddleware = makeAuthenticateClientByCredentialsMiddleware (AppDataSource.manager, isClientAuthenticatedQuery)

    // eventBusService.subscribe("client-ip-updated", async event => {

    //     if (Array.isArray(event) || event.name !== "client-ip-updated") {
    //         throw new AppError(500, `event payload do not match subscribed event name client-ip-updated`)
    //     }

    //     await createProcessorJobUC(event.data.clientId, event.data.ips, event.cid)
    // })


    // eventBusService.subscribe("job-pending", async event => {
        
    //     if (event.name !== "job-pending") {
    //         throw new AppError(500, `event payload do not match subscribed event name job-pending`)
    //     }
        
    //     await processProcessorJobUC(event.data.jobId, event.cid)
    // })




    const apiRouter                     = Router()
    const dynipUpdateReportingRouter    = Router()
    const dynipUpdateProcessingRouter   = Router()
    const iamRouter                     = Router()


    iamRouter.post("/login",            authenticateUserByCredentialsMiddleware,    makeGetUserAuthTokenQueryController(getUserAuthTokensQuery))
    iamRouter.post("/command/add-user", authenticateUserByTokenMiddleware,          makeAddUserCmdController(addUserCommand))

    iamRouter.get("/query/get-users",   authenticateUserByTokenMiddleware,          makeGetUsersQueryController(makeGetUsersQuery(logger, AppDataSource.manager)))


    apiRouter.use("/api/iam", iamRouter)
    apiRouter.use("/api/dynip-update-reporting", dynipUpdateReportingRouter)
    apiRouter.use("/api/dynip-update-processing", dynipUpdateProcessingRouter)



    await init.createRootUser(logger, AppDataSource.manager)


    makeApiServer(logger, apiRouter).listen(env.HTTP_PORT, env.HTTP_BIND, () => logger.info(`api listening on http://${env.HTTP_BIND}:${env.HTTP_PORT}`))
    
})()