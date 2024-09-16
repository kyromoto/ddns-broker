import { Request, Response, NextFunction } from "express"

import { makeAddUserCommand } from "@server/domains/iam/usecases/add-user"


export function makeAddUserCmdController(usecase: ReturnType<typeof makeAddUserCommand>) {

    return async (req: Request, res: Response, next: NextFunction) => {

        await usecase(req.id.toString(), req.body).catch(next)        
        return res.json({})

    }
    
}