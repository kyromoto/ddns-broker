import { Request, Response, NextFunction } from "express"

import { makeGetUsersQuery } from "@server/domains/iam/usecases/get-users"
import { makeGetUserAuthTokensQuery } from "@server/domains/iam/usecases/get-user-auth-tokens"
import { AppError } from "@server/domains/_errors/AppError"

import * as env from "@server/env"



export function makeGetUsersQueryController(usecase: ReturnType<typeof makeGetUsersQuery>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        return res.json(await usecase())
    }
}



export function makeGetUserAuthTokenQueryController(usecase: ReturnType<typeof makeGetUserAuthTokensQuery>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        
        if (!req.userId) {
            throw new AppError(400, "invalid user id")
        }

        const { accessToken, refreshToken } = await usecase({ userId: req.userId })

        res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, { httpOnly: true }).json({ accessToken })

    }
}