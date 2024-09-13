import { AppError } from "@server/domains/_errors/AppError"
import { JwtAccessTokenPayload } from "../values/JwtToken"
import { verifyToken } from "../utils/token-util"

export function makeGetUserIdFromAccessToken(accessTokenSecret: string) {
    
    return async (accessToken: string) => {

        const decoded = await verifyToken<JwtAccessTokenPayload>(accessToken, accessTokenSecret, JwtAccessTokenPayload)

        if (!decoded) {
            throw new AppError(401, "invalid access token")
        }

        return decoded.userId

    }
}