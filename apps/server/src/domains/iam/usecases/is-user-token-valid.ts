import { z } from "zod"
import { Logger } from "pino"
import { EntityManager } from "typeorm"

import { User } from "../models/User.model"
import { UserTokenPayload } from "../schemas/UserTokenPayload.schema"

import { verifyToken } from "../../dynip-update-reporting/utils/token-util"
import { AppError } from "@server/domains/_errors/AppError"



export function makeIsUserTokenValidQuery(logger: Logger, entityManager: EntityManager, secrets: { access: string, refresh: string }) {

    const getSecret = (type: "access" | "refresh") => {
        switch (type) {
            case "access":
                return secrets.access
            case "refresh":
                return secrets.refresh
        }
    }

    return async (cid: string, payload: { token: string, type: "access" | "refresh" }) => {

        try {
            
            const res = await verifyToken<UserTokenPayload>(payload.token, getSecret(payload.type), UserTokenPayload)

            const user = await entityManager.findOne(User, {
                where: { id: res.userId }
            })
    
            return !!user

        } catch (err) {
            
            if (err instanceof AppError) {
                throw err
            }

            throw new AppError(500, "error verifying token", err)
        }

        



    }
}