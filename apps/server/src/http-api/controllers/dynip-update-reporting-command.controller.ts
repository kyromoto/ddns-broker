import { makeAddClientCommand } from "@server/domains/dynip-update-reporting/usecases/add-client"

import { Request, Response, NextFunction } from "express"



export function makeAddClientCmdController(usecase: ReturnType<typeof makeAddClientCommand>) {

    return async (req: Request, res: Response, next: NextFunction) => {
        
        await usecase(req.id.toString(), req.body).catch(next)
        return res.json({})
    }
}