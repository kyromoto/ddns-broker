import { EventEmitter } from "node:events"

import { Logger } from "pino"

import { DdnsGatewayEvent } from "@packages/events/ddns-gateway";
import { EventBusService } from "@server/domains/ddns-gateway/interfaces";




class EventBusServiceImpl implements EventBusService {
    
    private _logger: Logger
    private _eventEmitter = new EventEmitter()

    constructor(logger: Logger) {
        this._logger = logger
    }

    async publish(event: DdnsGatewayEvent): Promise<void> {
        
        if (!this._eventEmitter.eventNames().includes(event.name)) {
            this._logger.warn({ event }, "no subscribers for event")
        }

        this._eventEmitter.emit(event.name, event)

    }

}


export const makeEventBusService = (logger: Logger) => new EventBusServiceImpl(logger)