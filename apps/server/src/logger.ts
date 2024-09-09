import { Request, Response } from "express"
import crypto from "node:crypto"

import pino from "pino"

import * as env from "./env"



const customLogLevel = (req: Request, res: Response, err: any) => {
    if (err || res.statusCode >= 500) {
        return 'error'
    }

    if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn'
    }

    return getLoglevel()
}


const genReqId = (req: Request, res: Response) => {
    const id = req.id || req.headers['x-request-id'] || crypto.randomUUID()
    res.setHeader('x-request-id', id.toString())
    return id
}


const getLoglevel = () => {
    return env.NODE_ENV === "development" ? "debug" : "info"
}


const customSuccessMessage = (req: Request, res: Response) => {
    return `${req.method} ${req.url} ${res.statusCode} ${res.statusMessage}`
}


const customErrorMessage = (req: Request, res: Response) => {
    return `${req.method} ${req.url} ${res.statusCode} ${res.statusMessage}`
}


export const loggerOptions: pino.LoggerOptions = {
    level: getLoglevel(),
}


export const loggerOptionsHttp = {
    customSuccessMessage,
    customErrorMessage,
    customLogLevel,
    genReqId,
    // quietReqLogger: true,
    // quietResLogger: true,
}