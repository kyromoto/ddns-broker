import { z } from "zod"
import { Logger } from "pino"
import { EntityManager, Repository } from "typeorm"

import { Client } from "../models/Client.model"
import { User } from "../models/User.model"
import { DynipUpdateReportingEvent } from "@packages/events/dynip-update-reporting.events"

import * as Regex from "../regexes"
import { generatePasswordHashAndSalt } from "../utils/password-util"
import { persistDomainEvent } from "../helpers/event-persistence"
import { EventBusService } from "../services/event-bus.service"
import { AppError } from "../../_errors/AppError"






export type AddClientCommandPayload = z.infer<typeof AddClientCommandPayload>
export const AddClientCommandPayload = z.object({
    userId: z.string().uuid(),
    name: z.string().regex(Regex.Client.name, "name do not match requirements"),
    password: z.string().regex(Regex.Password.password, "password do not match requirements"),
})


export function makeAddClientCommand(
    logger: Logger,
    entityManager: EntityManager,
    eventBusService: EventBusService
) {

    return async (cid: string, payload: AddClientCommandPayload) : Promise<void> => {

        await entityManager.transaction(async tm => {


            const validation = AddClientCommandPayload.safeParse(payload)

            if (!validation.success) {
                throw new AppError(400, "invalid payload", validation.error)
            }


            const existingClient = await tm.findOne(Client, { where: { name: payload.name } })

            if (existingClient) {
                throw new AppError(400, "clientname already exists")
            }


            const user = await tm.findOne(User, { where: { id: payload.userId } })

            if (!user) {
                throw new AppError(400, "user not found")
            }


            
            const password = generatePasswordHashAndSalt(payload.password)

            const client = await tm.save(Client, {
                clientname: payload.name,
                password,
                user
            })


            const event: DynipUpdateReportingEvent = {
                name: "client-added",
                cid,
                data: {
                    clientId: client.id,
                    userId: user.id
                }
            }


            await persistDomainEvent(tm, event)
            await eventBusService.publish(event, cid)

            logger.info(event)

        })

    }

}