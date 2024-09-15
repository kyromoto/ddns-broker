import { EntityManager } from "typeorm"


import { AppError } from "../../_errors/AppError"
import { Event } from "../models/Event"
import { IpUpdateProcessorEvent } from "@packages/events/ip-update-processor.events"


export async function persistDomainEvent(db: EntityManager, event: IpUpdateProcessorEvent) {

    const validation = IpUpdateProcessorEvent.safeParse(event)

    if (!validation.success) {
        throw new AppError(400, "invalid event", validation.error)
    }


    const events = await db.find(Event, { order: { sequence: "DESC" }, take: 1 })
    const lasteEvent = events[0]

    return await db.save(Event, {
        name: event.name,
        cid: event.cid,
        data: event.data,
        sequence: lasteEvent ? lasteEvent.sequence + 1 : 1,
        published: false
    })

}