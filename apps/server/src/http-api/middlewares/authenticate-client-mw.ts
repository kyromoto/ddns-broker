import { Request, Response, NextFunction } from "express"
import { Repository } from "typeorm"
import basicauth from "basic-auth"

import { Client } from "@server/domains/ddns-gateway/entities/Client"
import { AppError } from "@server/domains/_errors/AppError"
import { makeIsClientAuthenticatedQuery } from "@server/domains/ddns-gateway/usecases/is-client-authenticated"



export function makeAuthenticateClientMiddleware(usecase: ReturnType<typeof makeIsClientAuthenticatedQuery>, clientRepository: Repository<Client>) {

    return async (req: Request, res: Response, next: NextFunction) => {

        try {

            const credentials = basicauth(req)

            if (!credentials) {
                return res.status(401).send("badauth")
            }
    
            if (!await usecase(req.id.toString(), { clientname: credentials.name, password: credentials.pass })) {
                return res.status(401).send("badauth")
            }
    
            const client = await clientRepository.findOne({ where: { clientname: credentials.name } })

            if (!client) {
                throw new AppError(401, "client not found")
            }
    
            req.clientId = client.id
    
            next()

        } catch (error) {
            
            if (error instanceof AppError) {
                return next(error)
            }

            return next(new AppError(500, "internal server error while authenticating client"))

        }



        
    }

}