import { EventEmitter } from "node:events"

import { Logger } from "pino"

import { DdnsGatewayEvent, DdnsGatewayEventMap } from "@packages/events/ddns-gateway.events"
import { IpUpdateProcessorEvent, IpUpdateProcessorEventMap } from "@packages/events/ip-update-processor.events";
import { EventBusService as DdnsGwEBS } from "@server/domains/ddns-gateway/service-interfaces"
import { EventBusService as IpUpdateProcessorEBS } from "@server/domains/dynip-update-processing/service-interfaces";




class EventBusServiceImpl implements DdnsGwEBS, IpUpdateProcessorEBS {
    
    private _logger: Logger
    private _eventEmitter = new EventEmitter()

    constructor(logger: Logger) {
        this._logger = logger
    }


    publish(event: DdnsGatewayEvent | IpUpdateProcessorEvent, cid: string): Promise<boolean>
    publish(events: DdnsGatewayEvent[] | IpUpdateProcessorEvent[], cid: string): Promise<boolean>

    async publish(e: DdnsGatewayEvent | IpUpdateProcessorEvent | DdnsGatewayEvent[] | IpUpdateProcessorEvent[], cid: string): Promise<boolean> {
        
        let res = false
        const events = []

        Array.isArray(e) ? events.push(...e) : events.push(e)

        for (const event of events) {
            res = res && this._eventEmitter.emit(event.name, { cid, event })
        }
        
        return res
        
    }

    async subscribe<E extends (DdnsGatewayEvent | IpUpdateProcessorEvent)>(event: E["name"], handler: (event: E) => Promise<void>): Promise<void> {
        this._eventEmitter.addListener(event, handler)
    }

}


export const makeEventBusService = (logger: Logger) => new EventBusServiceImpl(logger)