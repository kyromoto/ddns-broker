import { Request, Response, NextFunction } from "express"
import { EntityManager, Repository } from "typeorm"
import basicauth from "basic-auth"


import { AppError } from "@server/domains/_errors/AppError"

import { makeIsUserCredentialsValidQuery } from "@server/domains/iam/usecases/is-user-credentials-valid"
import { User } from "@server/domains/iam/models/User.model"




export function makeAuthenticateUserByCredentialsMiddleware(entityManager: EntityManager, usecase: ReturnType<typeof makeIsUserCredentialsValidQuery>) {

    return async (req: Request, res: Response, next: NextFunction) => {

        try {

            const credentials = basicauth(req)

            if (!credentials) {
                throw new AppError(401, "no credentials provided")
            }


    
            if (!await usecase(req.id.toString(), { username: credentials.name, password: credentials.pass })) {
                throw new AppError(401, "invalid credentials")
            }


    
            const client = await entityManager.findOne(User, { where: { name: credentials.name } })

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