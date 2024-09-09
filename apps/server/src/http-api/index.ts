import http from "node:http"

import express, { Router } from "express"
import helmet from "helmet"
import cors from "cors"
import pinoHttp from "pino-http"
import pinoPretty from "pino-pretty"
import promBundle from "express-prom-bundle"

import * as env from "@server/env"

import { makeErrorHandler } from "./error"
import { loggerOptionsHttp } from "@server/logger"

import { Client } from "@server/domains/ddns-gateway/models/Client"



declare global {
    namespace Express {
        export interface Request {
            client: Client | null
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


export function makeApiServer(apiRouter: Router) {

    const api = express()
    const server = http.createServer(api)

    env.NODE_ENV === "production" && api.use(helmet())
    env.NODE_ENV === "production" && api.use(cors())

    api.use(express.json())
    api.use(pinoHttp(loggerOptionsHttp, pinoPretty({ colorize: true })))
    
    api.use(promBundle(promBundleOpts))
    api.use(apiRouter)

    api.use(makeErrorHandler())


    return server

}