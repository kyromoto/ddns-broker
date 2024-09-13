import { z } from "zod"
import { Logger } from "pino"
import { Repository } from "typeorm"

import { DdnsGatewayEvent } from "@packages/events/ddns-gateway.events"
import { Password } from "@server/domains/ddns-gateway/entities/Password"
import { User } from "@server/domains/ddns-gateway/entities/User"

import * as Regex from "../regexes"
import { AppError } from "../../_errors/AppError"
import { EventBusService } from "../service-interfaces"
import { persistDomainEvent } from "../helpers/event-persistence"
import { generatePasswordHashAndSalt } from "../utils/password-util"




export type AddUserCommandPayload = z.infer<typeof AddUserCommandPayload>
export const AddUserCommandPayload = z.object({
    username: z.string().regex(Regex.User.username, "username do not match requirements"),
    password: z.string().regex(Regex.Password.password, "password do not match requirements"),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
})



export function makeAddUserCommand(
    logger: Logger,
    userRepository: Repository<User>,
    passwordRepository: Repository<Password>,
    eventBusService: EventBusService
) {

    return async (cid: string, payload: AddUserCommandPayload) : Promise<void> => {

        await userRepository.manager.transaction(async tm => {
                
            const validationResult = AddUserCommandPayload.safeParse(payload)

            if (!validationResult.success) {
                throw new AppError(400, "invalid payload", validationResult.error)
            }

             
            const existingUser = await tm.findOne(User, { where: { username: payload.username } })

            if (existingUser) {
                throw new AppError(400, "username already exists")
            }



            const { hash, salt } = generatePasswordHashAndSalt(payload.password)

            const user = await tm.save(User, {
                ...payload,
                password: passwordRepository.create({ hash, salt }),
            })

            
            
            const event: DdnsGatewayEvent = {
                name: "user-added",
                cid,
                data: {
                    userId: user.id
                }
            }

            await persistDomainEvent(tm, event)
            await eventBusService.publish(event, cid)

            logger.info(event)

        })

    }
}