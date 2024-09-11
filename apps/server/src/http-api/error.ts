import { Request, Response, NextFunction } from "express"
import { Logger } from "pino"

import { AppError } from "@server/domains/_errors/AppError"



export function makeErrorHandler() {
    
    return function (err: Error, req: Request, res: Response, next: NextFunction) {

        if (res.headersSent) {
            return next(err)
        }

        if (err instanceof AppError) {
            return res.status(err.Code).json({ errors: [{ reason: err.Reason }] })
        }

        return res.status(500).json({ errors: [{ reason: "internal server error" }] })

    }
}