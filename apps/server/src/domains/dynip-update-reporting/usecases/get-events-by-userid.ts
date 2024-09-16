import { z } from "zod"
import { Logger } from "pino"
import { EntityManager } from "typeorm"

import { AppError } from "@server/domains/_errors/AppError"
import { EventBusService } from "../services/event-bus.service"

export function makeGetEventsByUserIdQuery(
    logger: Logger,
    entityManager: EntityManager,
    eventBusService: EventBusService
) {

    return async (userId: string) => {

        const validation = z.string().uuid().safeParse(userId)

        if (!validation.success) {
            throw new AppError(400, "invalid user id", validation.error)
        }

        const events = await eventBusService.getAllPublishedEvents()

        return events.filter(ev => ev.data.userId === validation.data)

    }
}