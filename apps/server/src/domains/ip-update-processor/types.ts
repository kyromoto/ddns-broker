import crypto from "crypto"

import { z } from "zod"



export type JobHandler = (job: Job) => Promise<JobEndState>



export type Task = z.infer<typeof Task>
export const Task = z.object({
    label: z.string(),
    data: z.object({
        clientId: z.string().uuid(),
        ips: z.array(z.string().ip()).min(1)
    })
})



export type JobStatus = z.infer<typeof JobStatus>
export const JobStatus = z.enum(['pending', 'running', 'completed', 'failed'])

export type JobEndState = z.infer<typeof JobEndState>
export const JobEndState = JobStatus.exclude(['pending', 'running'])


export type Job = z.infer<typeof Job>
export const Job = Task.extend({
    id: z.string().uuid().default(() => crypto.randomUUID()),
    status: JobStatus.default(JobStatus.Enum.pending),
})