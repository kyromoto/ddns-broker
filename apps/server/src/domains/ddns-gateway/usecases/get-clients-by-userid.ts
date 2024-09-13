import { z } from "zod"
import { Logger } from "pino"
import { Repository } from "typeorm"

import { User } from "../entities/User"

import { AppError } from "@server/domains/_errors/AppError"

export function makeGetClientsByUserIdQuery(
    logger: Logger,
    userRepository: Repository<User>,
) {

    return async (userId: string) => {

        const validation = z.string().uuid().safeParse(userId)

        if (!validation.success) {
            throw new AppError(400, "invalid user id", validation.error)
        }

        const user = await userRepository.findOne({
            where: { id: validation.data },
            relations: { clients: true }
        })

        if (!user) {
            throw new AppError(404, "user not found")
        }

        return user.clients

    }
}