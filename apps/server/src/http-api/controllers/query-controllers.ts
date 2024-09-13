import { Request, Response, NextFunction } from "express"

import { makeGetClientsByUserIdQuery } from "@server/domains/ddns-gateway/usecases/get-clients-by-userid"
import { makeGetEventsByUserIdQuery } from "@server/domains/ddns-gateway/usecases/get-events-by-userid"
import { makeRefreshUserTokensQuery } from "@server/domains/ddns-gateway/usecases/refresh-user-token"
import { makeLoginUserCommand } from "@server/domains/ddns-gateway/usecases/login-user"
import { makeGetUsersQuery } from "@server/domains/ddns-gateway/usecases/get-users"
import { AppError } from "@server/domains/_errors/AppError"
import * as env from "@server/env"


export function makePingQueryController() {
    return async (req: Request, res: Response, next: NextFunction) => {
        return res.json({ message: "pong", timestamp: Date.now() })
    }
}


export function makeGetUsersQueryController(usecase: ReturnType<typeof makeGetUsersQuery>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        return res.json(await usecase())
    }
}


export function makeGetClientsQueryController(usecase: ReturnType<typeof makeGetClientsByUserIdQuery>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        return res.json(await usecase(req.query.userId as string))
    }
}


export function makeGetEventsQueryController(usecase: ReturnType<typeof makeGetEventsByUserIdQuery>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        return res.json(await usecase(req.query.userId as string))
    }
}



export function makeRefreshTokenQueryController(usecase: ReturnType<typeof makeRefreshUserTokensQuery>) {
    return async (req: Request, res: Response, next: NextFunction) => {

        const token = req.cookies[env.REFRESH_TOKEN_COOKIE_NAME]

        if (!token || typeof token !== "string" || token.length === 0) {
            throw new AppError(401, "no refresh token provided")
        }

        const { accessToken, refreshToken } = await usecase({ refreshToken: token })

        return res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, { httpOnly: true, sameSite: "strict" }).json({ accessToken })

    }
}