import { Request, Response, NextFunction } from "express"

export function makePingQueryController() {
    return async (req: Request, res: Response, next: NextFunction) => {
        return res.json({ message: "pong", timestamp: Date.now() })
    }
}