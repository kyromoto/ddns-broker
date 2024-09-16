import { z } from "zod"

export type UserAddedEvent = z.infer<typeof UserAddedEvent>
export const UserAddedEvent = z.object({
    name: z.literal("user-added"),
    cid: z.string().uuid(),
    data: z.object({
        userId: z.string().uuid()
    })
})



export type IamEvent = z.infer<typeof IamEvent>
export const IamEvent = z.discriminatedUnion("name", [
    UserAddedEvent
])


export type IamEventMap = {
    "user-added" : (ev: UserAddedEvent, cid: string) => boolean
}