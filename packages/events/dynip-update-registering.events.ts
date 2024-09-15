import { z } from "zod";


export type UserAddedEvent = z.infer<typeof UserAddedEvent>
export const UserAddedEvent = z.object({
    name: z.literal("user-added"),
    cid: z.string().uuid(),
    data: z.object({
        userId: z.string().uuid()
    })
})

export type ClientAddedEvent = z.infer<typeof ClientAddedEvent>
export const ClientAddedEvent = z.object({
    name: z.literal("client-added"),
    cid: z.string().uuid(),
    data: z.object({
        userId: z.string().uuid(),
        clientId: z.string().uuid()
    })
})

export type ClientIpUpdatedEvent = z.infer<typeof ClientIpUpdatedEvent>
export const ClientIpUpdatedEvent = z.object({
    name: z.literal("client-ip-updated"),
    cid: z.string().uuid(),
    data: z.object({
        userId: z.string().uuid(),
        clientId: z.string().uuid(),
        ips: z.array(z.string().ip())
    })
})

export type DynipUpdateRegisteringEvent = z.infer<typeof DynipUpdateRegisteringEvent>
export const DynipUpdateRegisteringEvent = z.discriminatedUnion("name", [
    UserAddedEvent,
    ClientAddedEvent,
    ClientIpUpdatedEvent
])


export type DynipUpdateRegisteringEventMap = {
    "user-added"        : (ev: UserAddedEvent,       cid: string) => boolean
    "client-added"      : (ev: ClientAddedEvent,     cid: string) => boolean
    "client-ip-updated" : (ev: ClientIpUpdatedEvent, cid: string) => boolean
}