import crypto from "node:crypto"

import { Repository } from "typeorm";
import { createUser, User } from "./domains/ddns-gateway/entities/User";
import { Logger } from "pino";
import { createPasswordFromStr } from "./domains/ddns-gateway/entities/Password";

export async function createRootUser (logger: Logger, userRepository: Repository<User>) {

    const user = await userRepository.findOne({ where: { username: 'root' } })

    if (user) {
        return 
    }

    const passwordStr = crypto.randomBytes(32).toString('base64')

    const rootuser = await userRepository.save(createUser({
        username: 'root',
        password: createPasswordFromStr(passwordStr),
        email: 'root@localhost',
        firstName: 'root',
        lastName: 'root',
    }))

    logger.info(`Created user: ${rootuser.username} - ${passwordStr}`)

}