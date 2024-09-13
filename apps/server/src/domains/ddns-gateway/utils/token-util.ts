import jwt from "jsonwebtoken"

import { AppError } from "@server/domains/_errors/AppError"



export function signToken<PayloadType extends Object> (payload: PayloadType, secret: string, expiresIn: string) : Promise<string> {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(payload, secret, { expiresIn }, (err, token) => {
            
            if (err) {
                return reject(new AppError(500, "failed to sign refresh token", { error: err, payload }))
            }

            if (!token) {
                return reject(new AppError(500, "failed to sign refresh token", { error: "token was undefined", payload }))
            }

            return resolve(token)

        })
    })
}



export function verifyToken<PayloadType extends Object> (token: string, secret: string, payloadSchema: z.ZodType<PayloadType>) : Promise<PayloadType> {
    return new Promise<PayloadType>((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
                    
            if (err) {
                return reject(new AppError(401, "invalid refresh token", err))
            }
            

            const validation = payloadSchema.safeParse(decoded)

            if (!validation.success) {
                return reject(new AppError(401, "invalid refresh token", validation.error))
            }

            return resolve(validation.data)
        })
    })
}