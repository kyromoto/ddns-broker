import { Repository } from "typeorm"
import { Logger } from "pino"

import { Client } from "../entities/Client"



export function makeIsClientAuthenticatedQuery(logger: Logger, clientRepository: Repository<Client>) {

    return async (cid: string, payload: { clientname: string, password: string }) => {

        const { clientname, password } = payload

        const client = await clientRepository.findOne({
            where: { clientname },
            relations: { password: true }
        })

        if (!client) {
            return false
        }

        return client.isCorrectpassword(password)

    }

}