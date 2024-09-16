import { EntityManager } from "typeorm"
import { Logger } from "pino"

import { Client } from "../models/Client.model"

import * as passwordUtils from "../utils/password-util"



export function makeIsClientAuthenticatedQuery(logger: Logger, entityManager: EntityManager) {

    return async (cid: string, payload: { name: string, password: string }) => {

        const { name, password } = payload

        const client = await entityManager.findOne(Client, {
            where: { name },
            relations: { password: true }
        })

        if (!client) {
            return false
        }

        return client.password.hash === passwordUtils.generateHash(password, client.password.salt)
        
    }

}