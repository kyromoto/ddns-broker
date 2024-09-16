import { Logger } from "pino"
import { EntityManager, Repository } from "typeorm"

import { User } from "../models/User.model"

import * as passwordUtils from "@server/domains/dynip-update-reporting/utils/password-util"



export function makeIsUserCredentialsValidQuery(logger: Logger, entityManager: EntityManager) {

    return async (cid: string, payload: { username: string, password: string }) => {

        const { username, password } = payload

        const user = await entityManager.findOne(User, {
            where: { name: username },
            relations: { password: true }
        })

        if (!user) {
            return false
        }

        return user.password.hash === passwordUtils.generateHash(password, user.password.salt)

    }

}