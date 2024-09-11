import { EventEmitter } from "node:stream"

import { z } from "zod"

import { IpUpdateProcessorEvent, IpUpdateProcessorEventMap } from "@packages/events/ip-update-processor.events"
import { Job } from "./models/Job"
import { JobEndState } from "./types"
import { IpUpdateProcessor, IpUpdateProcessorApi, IpUpdateProcessorResult } from "./processor-Interfaces"
import { DdnsGatewayEvent } from "@packages/events/ddns-gateway.events"



export interface EventBusService {
    publish(event: DdnsGatewayEvent | IpUpdateProcessorEvent, cid: string): Promise<boolean>
    publish(events: DdnsGatewayEvent[] | IpUpdateProcessorEvent[], cid: string): Promise<boolean>
    subscribe<E extends (DdnsGatewayEvent | IpUpdateProcessorEvent)>(event: E['name'], handler: (event: E) => Promise<void>): Promise<void>
}


export type ProcessorResult = JobEndState
export const ProcessorResult = z.enum(['completed', 'failed'])


export interface ProcessorRegistryService {
    register(name: string, process: (name: string, job: Job, cid: string) => Promise<void>): void
    queueJob(name: string, job: Job, cid: string): void
    hasProcessor(name: string): boolean
}