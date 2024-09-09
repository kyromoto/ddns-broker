import { Logger } from "pino"
import { Repository } from "typeorm"
import { Request, Response, NextFunction } from "express"
import basicauth from "basic-auth"

import { Client } from "@server/domains/ddns-gateway/models/Client"
import { makeIsClientAuthenticatedQuery } from "@server/domains/ddns-gateway/usecases/is-client-authenticated"



export function makeAuthenticateClientMiddleware(usecase: ReturnType<typeof makeIsClientAuthenticatedQuery>, clientRepository: Repository<Client>) {

    return async (req: Request, res: Response, next: NextFunction) => {

        const credentials = basicauth(req)

        if (!credentials) {
            return res.status(401).send("badauth")
        }


        const payload = { clientname: credentials.name, password: credentials.pass }

        if (!await usecase(req.id.toString(), payload)) {
            return res.status(401).send("badauth")
        }

        req.client = await clientRepository.findOne({ where: { clientname: credentials.name } })

        next()
        
    }

}