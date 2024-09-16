import { z } from "zod"
import { Logger } from "pino"
import { EntityManager } from "typeorm"

import { User } from "../models/User.model"

import { AppError } from "@server/domains/_errors/AppError"

export function makeGetUsersQuery(
    logger: Logger,
    entityManager: EntityManager,
) {
    return async () => {
        return  await entityManager.find(User)
    }
}