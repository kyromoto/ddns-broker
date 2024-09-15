import crypto from "crypto"

import { z } from "zod"



export type JobEndState = z.infer<typeof JobEndState>
export const JobEndState = z.enum(['completed', 'failed'])

export type JobStatus = z.infer<typeof JobStatus>
export const JobStatus = z.enum(['pending', 'running', ...JobEndState.options])