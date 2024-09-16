import crypto from "node:crypto"

import { Logger } from "pino"
import { EntityManager } from "typeorm";

import { createUser, User } from "./domains/iam/models/User.model";
import * as passwordUtils from "./domains/dynip-update-reporting/utils/password-util";

export async function createRootUser (logger: Logger, entityManager: EntityManager) {

    const user = await entityManager.findOne(User, { where: { name: 'root' } })

    if (user) {
        return 
    }

    const passwordStr = crypto.randomBytes(32).toString('base64')

    const rootuser = await entityManager.save(User, createUser({
        name: 'root',
        password: {
            ...passwordUtils.generatePasswordHashAndSalt(passwordStr),
            version: 1
        },
        email: 'root@localhost',
    }))

    logger.info(`Created user: ${rootuser.name} - ${passwordStr}`)

}