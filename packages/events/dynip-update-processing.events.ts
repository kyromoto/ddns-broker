import { z } from "zod"


export type JobCreatedEvent = z.infer<typeof JobCreatedEvent>
export const JobCreatedEvent = z.object({
    name: z.literal("job-created"),
    cid: z.string().uuid(),
    data: z.object({
        jobId: z.string().uuid()
    })
})


export type JobPendingEvent = z.infer<typeof JobPendingEvent>
export const JobPendingEvent = z.object({
    name: z.literal("job-pending"),
    cid: z.string().uuid(),
    data: z.object({
        jobId: z.string().uuid()
    })
})


export type JobRunningEvent = z.infer<typeof JobRunningEvent>
export const JobRunningEvent = z.object({
    name: z.literal("job-running"),
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


export type DynipUpdateProcessingEvent = z.infer<typeof DynipUpdateProcessingEvent>
export const DynipUpdateProcessingEvent = z.discriminatedUnion("name", [
    JobPendingEvent,
    JobRunningEvent,
    JobFailedEvent,
    JobCompletedEvent
])


export type DynipUpdateProcessingEventMap = {
    "job-pending"   : (ev: JobPendingEvent, cid: string) => boolean
    "job-running"   : (ev: JobRunningEvent, cid: string) => boolean
    "job-failed"    : (ev: JobFailedEvent,  cid: string) => boolean
    "job-completed" : (ev: JobCompletedEvent, cid: string) => boolean
}