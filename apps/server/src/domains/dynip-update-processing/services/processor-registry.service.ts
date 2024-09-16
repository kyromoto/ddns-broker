import { Job } from "../models/Job.model"

export interface ProcessorRegistryService {
    register(name: string, process: (name: string, job: Job, cid: string) => Promise<void>): void
    queueJob(name: string, job: Job, cid: string): void
    hasProcessor(name: string): boolean
}