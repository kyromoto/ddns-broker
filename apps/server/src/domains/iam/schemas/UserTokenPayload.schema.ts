import { z } from "zod"

export type UserTokenPayload = z.infer<typeof UserTokenPayload>
export const UserTokenPayload = z.object({
    userId: z.string().uuid(),
    role: z.array(z.string())
})