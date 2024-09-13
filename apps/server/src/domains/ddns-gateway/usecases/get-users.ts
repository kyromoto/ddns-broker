import { z } from "zod"
import { Logger } from "pino"
import { Repository } from "typeorm"

import { User } from "../entities/User"

import { AppError } from "@server/domains/_errors/AppError"

export function makeGetUsersQuery(
    logger: Logger,
    userRepository: Repository<User>,
) {
    return async () => {
        return  await userRepository.find()
    }
}