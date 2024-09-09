import { z } from "zod"


export type JobQueuedEvent = z.infer<typeof JobQueuedEvent>
export const JobQueuedEvent = z.object({
    name: z.literal("job-queued"),
    cid: z.string().uuid(),
    data: z.object({
        jobId: z.string().uuid()
    })
})


export type JobStartedEvent = z.infer<typeof JobStartedEvent>
export const JobStartedEvent = z.object({
    name: z.literal("job-started"),
    cid: z.string().uuid(),
    data: z.object({
        jobId: z.string().uuid()
    })
})


export type JobFailedEvent = z.infer<typeof JobFailedEvent>
export const JobFailedEvent = z.object({
    name: z.literal("job-failed"),
    cid: z.string().uuid(),
    data: z.object({
        jobId: z.string().uuid(),
        error: z.string()
    })
})


export type JobCompletedEvent = z.infer<typeof JobCompletedEvent>
export const JobCompletedEvent = z.object({
    name: z.literal("job-completed"),
    cid: z.string().uuid(),
    data: z.object({
        jobId: z.string().uuid()
    })
})


export type IpUpdateProcessorEvent = z.infer<typeof IpUpdateProcessorEvent>
export const IpUpdateProcessorEvent = z.discriminatedUnion("name", [
    JobQueuedEvent,
    JobStartedEvent,
    JobFailedEvent,
    JobCompletedEvent
])