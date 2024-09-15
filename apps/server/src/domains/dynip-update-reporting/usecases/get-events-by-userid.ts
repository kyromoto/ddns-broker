
import { z } from "zod"
import { Logger } from "pino"
import { Repository } from "typeorm"

import { Event } from "../models/Event"

import { AppError } from "@server/domains/_errors/AppError"

export function makeGetEventsByUserIdQuery(
    logger: Logger,
    eventRepository: Repository<Event>,
) {

    return async (userId: string) => {

        const validation = z.string().uuid().safeParse(userId)

        if (!validation.success) {
            throw new AppError(400, "invalid user id", validation.error)
        }

        const events = await eventRepository.createQueryBuilder("event")
            .where("JSON_EXTRACT(event.data, '$.userId') = :userId", { userId: validation.data })
            .orderBy("event.sequence", "DESC")
            .getMany()

        return events

    }
}