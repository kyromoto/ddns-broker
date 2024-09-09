import { z } from "zod"
import { Logger } from "pino"
import { Repository } from "typeorm"

import { DdnsGatewayEvent } from "@packages/events/ddns-gateway"
import { Password } from "@server/domains/ddns-gateway/models/Password"
import { Client } from "@server/domains/ddns-gateway/models/Client"
import { User } from "@server/domains/ddns-gateway/models/User"

import * as Regex from "../regexes"
import { generatePasswordHashAndSalt } from "../utils"
import { persistDomainEvent } from "../helpers/event-persistence"
import { EventBusService } from "../interfaces"
import { AppError } from "../../_errors/AppError"





export type AddClientCommandPayload = z.infer<typeof AddClientCommandPayload>
export const AddClientCommandPayload = z.object({
    userId: z.string().uuid(),
    clientname: z.string().regex(Regex.Client.clientname, "username do not match requirements"),
    password: z.string().regex(Regex.Password.password, "password do not match requirements"),
})


export function makeAddClientCommand(
    logger: Logger,
    clientRepository: Repository<Client>,
    passwordRepository: Repository<Password>,
    eventBusService: EventBusService
) {

    return async (cid: string, payload: AddClientCommandPayload) : Promise<void> => {

        await clientRepository.manager.transaction(async tm => {


            const validation = AddClientCommandPayload.safeParse(payload)

            if (!validation.success) {
                throw new AppError(400, "invalid payload", validation.error)
            }


            const existingClient = await tm.findOne(Client, { where: { clientname: payload.clientname } })

            if (existingClient) {
                throw new AppError(400, "clientname already exists")
            }


            const user = await tm.findOne(User, { where: { id: payload.userId } })

            if (!user) {
                throw new AppError(400, "user not found")
            }


            
            const { hash, salt } = generatePasswordHashAndSalt(payload.password)

            const client = await tm.save(Client, {
                clientname: payload.clientname,
                password: passwordRepository.create({ hash, salt }),
                user
            })


            const event: DdnsGatewayEvent = {
                name: "client-added",
                cid,
                data: {
                    clientId: client.id,
                    userId: user.id
                }
            }


            await persistDomainEvent(tm, event)
            await eventBusService.publish(event)

            logger.info(event)

        })

    }

}