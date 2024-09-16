import { EventEmitter } from "node:events"

import { Logger } from "pino"


import { EventBusService as IamEBS } from "@server/domains/iam/services/event-bus.service"
import { EventBusService as DynipUpdateReportingEBS } from "@server/domains/dynip-update-reporting/services/event-bus.service"
import { EventBusService as DynipUpdateProcessingEBS } from "@server/domains/dynip-update-processing/services/event-bus.service"
import { DynipUpdateReportingEvent, ClientIpUpdatedEvent } from "@packages/events/dynip-update-reporting.events"
import { EntityManager, In } from "typeorm"
import { AppError } from "@server/domains/_errors/AppError"
import { Event } from "./schemas/Event.schema"
import { ApplicationEvent } from "@packages/events"
import { DynipUpdateProcessingEvent } from "@packages/events/dynip-update-processing.events"
import { IamEvent } from "@packages/events/iam.events"




class EventBusServiceImpl implements IamEBS, DynipUpdateReportingEBS, DynipUpdateProcessingEBS {
    
    private _eventEmitter = new EventEmitter()

    constructor(private _logger: Logger, private _entityManager: EntityManager) {}
  
    async publish(ev: ApplicationEvent | ApplicationEvent[], cid: string): Promise<boolean> {

       try {

            const incomingEvents: ApplicationEvent[] = []

            Array.isArray(ev) ? incomingEvents.push(...ev) : incomingEvents.push(ev)
            
            await this._entityManager.transaction(async tm => {

                const savedEvents = await tm.find(Event, { order: { sequence: "DESC" }, take: 1 })
                let eventSeq = savedEvents[0] ? savedEvents[0].sequence : 0

                for (const appEvent of incomingEvents) {
                    
                    const savedEvent = await this._entityManager.save(Event, {
                        ...ev,
                        sequence: ++eventSeq
                    })

                    this._eventEmitter.emit(savedEvent.name, savedEvent)

                }

            })


            return true


        } catch (err) {

            if (err instanceof AppError) {
                throw err
            }

            throw new AppError(500, "failed to publish event", { error: err })

        }

    }



    async getAllPublishedEvents(): Promise<DynipUpdateReportingEvent[]> {

        const eventNames = DynipUpdateReportingEvent.options.map(o => o.shape.name.value)

        const events = await this._entityManager.find(Event, {
            where: { name: In(eventNames) },
            order: { sequence: "ASC" }
        })


        return events as DynipUpdateReportingEvent[]

    }



    async getLastPublishedClientIpHasChangedEvent(clientId: string): Promise<ClientIpUpdatedEvent | undefined> {
        
        const events = await this._entityManager.find(Event, {
            where: { name: ClientIpUpdatedEvent.shape.name.value },
            order: { sequence: "DESC" },
            take: 1
        })

        return events[0] as ClientIpUpdatedEvent

    }

    async subscribe<E extends ApplicationEvent>(event: E["name"], handler: (event: E) => Promise<void>): Promise<void> {
        this._eventEmitter.addListener(event, handler)
    }

}


export const makeEventBusService = (logger: Logger, entityManager: EntityManager) => new EventBusServiceImpl(logger, entityManager)