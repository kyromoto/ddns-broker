import { Request, Response, NextFunction } from "express"

import { makeGetClientsByUserIdQuery } from "@server/domains/dynip-update-reporting/usecases/get-clients-by-userid"


export function makeGetClientsQueryController(usecase: ReturnType<typeof makeGetClientsByUserIdQuery>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        return res.json(await usecase(req.query.userId as string))
    }
}