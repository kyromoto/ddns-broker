import { Request, Response, NextFunction, Router } from "express"
import { Repository } from "typeorm"

import { Password } from "@server/domains/ddns-gateway/models/Password"
import { Client } from "@server/domains/ddns-gateway/models/Client"
import { Event } from "@server/domains/ddns-gateway/models/Event"
import { User } from "@server/domains/ddns-gateway/models/User"

import { makeAddUserCommand } from "@server/domains/ddns-gateway/usecases/add-user"
import { makeAddClientCommand } from "@server/domains/ddns-gateway/usecases/add-client"
import { makeUpdateClientIpExecutor } from "@server/domains/ddns-gateway/usecases/update-client-ip"




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