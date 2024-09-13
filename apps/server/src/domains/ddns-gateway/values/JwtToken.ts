import { z } from "zod"


export type JwtAccessTokenPayload = z.infer<typeof JwtAccessTokenPayload>
export const JwtAccessTokenPayload = z.object({
    userId: z.string().uuid()
})


export type JwtRefreshTokenPayload = z.infer<typeof JwtRefreshTokenPayload>
export const JwtRefreshTokenPayload = z.object({
    userId: z.string().uuid()
})