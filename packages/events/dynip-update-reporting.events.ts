import { z } from "zod";

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
    name: z.literal("client-ip-has-changed"),
    cid: z.string().uuid(),
    data: z.object({
        userId: z.string().uuid(),
        clientId: z.string().uuid(),
        ips: z.array(z.string().ip())
    })
})

export type DynipUpdateReportingEvent = z.infer<typeof DynipUpdateReportingEvent>
export const DynipUpdateReportingEvent = z.discriminatedUnion("name", [
    ClientAddedEvent,
    ClientIpUpdatedEvent
])


export type DynipUpdateRegisteringEventMap = {
    "client-added"      : (ev: ClientAddedEvent,     cid: string) => boolean
    "client-ip-updated" : (ev: ClientIpUpdatedEvent, cid: string) => boolean
}