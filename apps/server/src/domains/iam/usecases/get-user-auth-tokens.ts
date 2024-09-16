import { z } from "zod"
import { Logger } from "pino"
import { EntityManager } from "typeorm"


import { User } from "../models/User.model"
import { AppError } from "@server/domains/_errors/AppError"
import { JwtAccessTokenPayload, JwtRefreshTokenPayload } from "../../dynip-update-reporting/values/JwtToken"
import { signToken } from "../../dynip-update-reporting/utils/token-util"



export function makeGetUserAuthTokensQuery(logger: Logger, entityManager: EntityManager, secrets: { access: string, refresh: string }) {

    return async (payload: { userId: string }) => {

        try {

            const validation = z.string().uuid().safeParse(payload.userId)

            if (!validation.success) {
                throw new AppError(400, "invalid user id", validation.error)
            }



            const user = await entityManager.findOne(User, {
                where: { id: validation.data }
            })

            if (!user) {
                throw new AppError(404, "user not found")
            }

            
    
            const accessTokenPayload: JwtAccessTokenPayload = { userId: user.id }
            const refreshTokenPayload: JwtRefreshTokenPayload = { userId: user.id }
    
            const accessToken = await signToken(accessTokenPayload, secrets.access, "15m")
            const refreshToken = await signToken(refreshTokenPayload, secrets.refresh, "1d")
    
            return { accessToken: accessToken, refreshToken }

        } catch (error) {
            
            if (error instanceof AppError) {
                throw error
            }

            throw new AppError(500, "internal error while creating user tokens", error)
        }

    }
}