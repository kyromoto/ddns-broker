import { z } from "zod"
import { Logger } from "pino"
import { EntityManager, Repository } from "typeorm"

import { IamEvent } from "@packages/events/iam.events"
import { User } from "../models/User.model"

import * as Regex from "../../dynip-update-reporting/regexes"
import { AppError } from "../../_errors/AppError"
import { EventBusService } from "../services/event-bus.service"
import { generatePasswordHashAndSalt } from "../../dynip-update-reporting/utils/password-util"





export type AddUserCommandPayload = z.infer<typeof AddUserCommandPayload>
export const AddUserCommandPayload = z.object({
    username: z.string().regex(Regex.User.name, "username do not match requirements"),
    password: z.string().regex(Regex.Password.password, "password do not match requirements"),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
})



export function makeAddUserCommand(
    logger: Logger,
    entityManager: EntityManager,
    eventBusService: EventBusService
) {

    return async (cid: string, payload: AddUserCommandPayload) : Promise<void> => {

        await entityManager.transaction(async tm => {
                
            const validationResult = AddUserCommandPayload.safeParse(payload)

            if (!validationResult.success) {
                throw new AppError(400, "invalid payload", validationResult.error)
            }

             
            const existingUser = await tm.findOne(User, { where: { name: payload.username } })

            if (existingUser) {
                throw new AppError(400, "username already exists")
            }

            const user = await tm.save(User, {
                ...payload,
                password: {
                    ...generatePasswordHashAndSalt(payload.password),
                    version: 1
                }
            })

            
            
            const event: IamEvent = {
                name: "user-added",
                cid,
                data: {
                    userId: user.id
                }
            }

            await eventBusService.publish(event, cid)

            logger.info(event)

        })

    }
}