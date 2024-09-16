import { Request, Response, NextFunction } from "express"
import { EntityManager, Logger, Repository } from "typeorm"
import basicauth from "basic-auth"


import { AppError } from "@server/domains/_errors/AppError"
import { makeIsClientAuthenticatedQuery } from "@server/domains/dynip-update-reporting/usecases/is-client-credentials-valid"
import { Client } from "@server/domains/dynip-update-reporting/models/Client.model"




export function makeAuthenticateClientByCredentialsMiddleware(entityManager: EntityManager, usecase: ReturnType<typeof makeIsClientAuthenticatedQuery> ) {

    return async (req: Request, res: Response, next: NextFunction) => {

        try {

            const credentials = basicauth(req)

            if (!credentials) {
                return res.status(401).send("badauth")
            }


    
            if (!await usecase(req.id.toString(), { name: credentials.name, password: credentials.pass })) {
                return res.status(401).send("badauth")
            }


    
            const client = await entityManager.findOne(Client, { where: { name: credentials.name } })

            if (!client) {
                return res.status(401).send("badauth")
            }


    
            req.clientId = client.id
    
            next()

        } catch (error) {
            
            req.log.error(error)

            return res.status(500).send("911")

        }
    
    }

}