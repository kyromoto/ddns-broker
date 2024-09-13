import http from "node:http"

import express, { Router } from "express"
import helmet from "helmet"
import cors from "cors"
import pinoHttp from "pino-http"
import pinoPretty from "pino-pretty"
import promBundle from "express-prom-bundle"
import { Logger } from "pino"

import * as env from "@server/env"

import { makeErrorHandler } from "./error"
import { loggerOptionsHttp } from "@server/logger"

import { Client } from "@server/domains/ddns-gateway/entities/Client"




declare global {
    namespace Express {
        export interface Request {
            userId: string | null
            clientId: string | null
        }
    }
}


const promBundleOpts: promBundle.Opts = {
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    promClient: {
        collectDefaultMetrics: {}
    }
}


const corsConfig: cors.CorsOptions = {
    origin: "*",
}


export function makeApiServer(logger: Logger, apiRouter: Router) {

    const api = express()
    const server = http.createServer(api)

    api.use(helmet())
    api.use(cors(corsConfig))

    api.use(express.json())
    api.use(pinoHttp(loggerOptionsHttp, pinoPretty({ colorize: true })))
    
    api.use(promBundle(promBundleOpts))
    api.use(apiRouter)

    api.use(makeErrorHandler())


    logger.info(corsConfig, "cors config")


    return server

}