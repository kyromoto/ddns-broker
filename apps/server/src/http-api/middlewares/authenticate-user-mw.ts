import { Request, Response, NextFunction } from "express"

import bearerauth from "@server/http-api/utils/bearer-auth"

import { AppError } from "@server/domains/_errors/AppError"
import { makeGetUserIdFromAccessToken } from "@server/domains/ddns-gateway/usecases/get-userid-from-accesstoken"



export function makeAuthenticateUserMiddleware(usecase: ReturnType<typeof makeGetUserIdFromAccessToken>) {

    return async (req: Request, res: Response, next: NextFunction) => {

        try {

            const accessToken = bearerauth(req)

            if (!accessToken) {
                return next(new AppError(401, "no access token provided"))
            }
    
            req.userId = await usecase(accessToken)
    
            return next()

        } catch (error) {
            
            if (error instanceof AppError) {
                return next(error)
            }

            return next(new AppError(500, "internal server error while authenticating user"))

        }
        
    }
}