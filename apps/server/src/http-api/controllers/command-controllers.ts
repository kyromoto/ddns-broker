import { Request, Response, NextFunction, Router } from "express"
import { Repository } from "typeorm"
import basicauth from "basic-auth"

import * as env from "@server/env"
import { Password } from "@server/domains/ddns-gateway/entities/Password"
import { Client } from "@server/domains/ddns-gateway/entities/Client"
import { Event } from "@server/domains/ddns-gateway/entities/Event"
import { User } from "@server/domains/ddns-gateway/entities/User"

import { makeAddUserCommand } from "@server/domains/ddns-gateway/usecases/add-user"
import { makeAddClientCommand } from "@server/domains/ddns-gateway/usecases/add-client"
import { makeLoginUserCommand } from "@server/domains/ddns-gateway/usecases/login-user"
import { AppError } from "@server/domains/_errors/AppError"






export function makeAddUserCmdController(usecase: ReturnType<typeof makeAddUserCommand>) {

    return async (req: Request, res: Response, next: NextFunction) => {

        await usecase(req.id.toString(), req.body).catch(next)        
        return res.json({})

    }
    
}


export function makeAddClientCmdController(usecase: ReturnType<typeof makeAddClientCommand>) {

    return async (req: Request, res: Response, next: NextFunction) => {
        
        await usecase(req.id.toString(), req.body).catch(next)
        return res.json({})
    }
}



export function makeLoginUserCommandController(usecase: ReturnType<typeof makeLoginUserCommand>) {
    return async (req: Request, res: Response, next: NextFunction) => {

        const credentials = basicauth(req)

        if (!credentials) {
            throw new AppError(401, "no basic auth credentials provided")
        }

        const { accessToken, refreshToken } = await usecase({ username: credentials.name, password: credentials.pass })

        return res
            // .cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, { httpOnly: true })
            .json({ accessToken })

    }
}