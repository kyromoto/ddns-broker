import jwt from "jsonwebtoken"
import { Logger } from "pino"
import { Repository } from "typeorm"

import { User } from "../models/User"
import { AppError } from "@server/domains/_errors/AppError"
import { JwtAccessTokenPayload, JwtRefreshTokenPayload } from "../values/JwtToken"
import { signToken, verifyToken } from "../utils/token-util"

export function makeRefreshUserTokensQuery(logger: Logger, userRepository: Repository<User>, secrets: { access: string, refresh: string }) {

    return async (payload: { refreshToken: string }) => {

        try {

            const decoded = await verifyToken<JwtRefreshTokenPayload>(payload.refreshToken, secrets.refresh, JwtRefreshTokenPayload)

            if (!decoded) {
                throw new AppError(401, "invalid refresh token")
            }


            const user = await userRepository.findOne({ where: { id: decoded.userId } })

            if (!user) {
                throw new AppError(401, "user not found")
            }


            const accessTokenPayload: JwtAccessTokenPayload = { userId: user.id }
            const refreshTokenPayload: JwtRefreshTokenPayload = { userId: user.id }

            const accessToken =  await signToken(accessTokenPayload, secrets.access, "15m")
            const refreshToken = await signToken(refreshTokenPayload, secrets.refresh, "1d")

            return { accessToken, refreshToken }

        } catch (error) {
            
            if (error instanceof AppError) {
                throw error
            }

            throw new AppError(500, "internal error while refreshing user tokens", error)

        }

    }

}