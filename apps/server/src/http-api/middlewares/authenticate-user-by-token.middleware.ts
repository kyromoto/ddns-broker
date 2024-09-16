import { Request, Response, NextFunction } from "express"

import bearerauth from "@server/http-api/utils/bearer-auth"

import { AppError } from "@server/domains/_errors/AppError"
import { makeIsUserCredentialsValidQuery } from "@server/domains/iam/usecases/is-user-credentials-valid"
import { makeIsUserTokenValidQuery } from "@server/domains/iam/usecases/is-user-token-valid"
import { EntityManager } from "typeorm"



export function makeAuthenticateUserByTokenMiddleware(entityManager: EntityManager, usecase: ReturnType<typeof makeIsUserTokenValidQuery>) {

    return async (req: Request, res: Response, next: NextFunction) => {

        try {

            const accessToken = bearerauth(req)

            if (!accessToken) {
                return next(new AppError(401, "no access token provided"))
            }
    
            if (!await usecase(req.id.toString(), { token: accessToken, type: "access" })) {
                return next(new AppError(401, "invalid access token"))
            }

            // Todo: add userid to req
    
            return next()

        } catch (error) {
            
            if (error instanceof AppError) {
                return next(error)
            }

            return next(new AppError(500, "internal server error while authenticating user"))

        }
        
    }
}