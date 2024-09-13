import { Logger } from "pino"
import { Repository } from "typeorm"

import { User } from "../entities/User"
import { AppError } from "@server/domains/_errors/AppError"
import { JwtAccessTokenPayload, JwtRefreshTokenPayload } from "../values/JwtToken"
import { signToken } from "../utils/token-util"



export function makeLoginUserCommand(logger: Logger, userRepository: Repository<User>, secrets: { access: string, refresh: string }) {

    return async (payload: { username: string, password: string }) => {

        try {

            if (!payload) {
                throw new AppError(400, "invalid payload")
            }

            if (typeof payload !== "object") {
                throw new AppError(400, "invalid payload")
            }

            if (!payload.username || !payload.password) {
                throw new AppError(400, "invalid payload")
            }



            const user = await userRepository.findOne({
                where: { username: payload.username },
                relations: { password: true }
            })

            if (!user) {
                throw new AppError(404, "user not found")
            }
    
            if (!user.isCorrectPassword(payload.password)) {
                throw new AppError(401, "invalid credentials")
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