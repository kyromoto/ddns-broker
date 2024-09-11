import { z } from "zod"

type IpUpdateProcessorLoggerFn = (message: string, data?: any) => void


export interface IpUpdateProcessorLogger {
    info:   IpUpdateProcessorLoggerFn
    warn:   IpUpdateProcessorLoggerFn
    error:  IpUpdateProcessorLoggerFn
    debug:  IpUpdateProcessorLoggerFn
}

export interface IpUpdateProcessorApi<T extends Object> {
    getProcessorConfig: () => T
    getProcessorSchema: () => z.ZodType<T>
    getClientIps: () => string[]
    getCorrelationId: () => string
    getLogger: () => IpUpdateProcessorLogger
}

type IpUpdateProcessorResultCompleted = {
    status: "completed"
}

type IpUpdateProcessorResultFailed = {
    status: "failed"
    error: {
        message: string,
        data?: any
    }
}

export type IpUpdateProcessorResult = 
    | IpUpdateProcessorResultCompleted
    | IpUpdateProcessorResultFailed


export type IpUpdateProcessor<T extends Object> = {
    name: string
    version: string
    config: {
        schema: z.ZodType<T>
    }
    exec: (api: IpUpdateProcessorApi<T>) => Promise<IpUpdateProcessorResult>
}