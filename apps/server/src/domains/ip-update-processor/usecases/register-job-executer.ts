import EventEmitter from "node:events"

import { Repository } from "typeorm"
import fastq, { queue, done } from "fastq"

import { JobHandler, Job } from "../types"
import { Job as JobModel } from "../models/Job"






export function makeRegisterJobExecuter(jobRepository: Repository<JobModel>, pubsub: EventEmitter) {

    return async function registerJobExecuter(label: string, concurrency: number, handler: JobHandler) : Promise<void> {

        const worker = async (job: Job, done: done) => {
    
            let status: "completed" | "failed" = 'failed'
    
            try {
                await jobRepository.update({ id: job.id }, { status: "running" })
                status = await handler(job)
                done(null)
            } catch (error: any) {
                done(error)
            } finally {
                await jobRepository.update({ id: job.id }, { status })
            }
        }
    
        const subscriberQueue: queue<Job> = fastq(worker, concurrency)
        
    
    
        // if is first subscriber, push all pending jobs from store
        
        if (!pubsub.eventNames().includes(label)) {
            
            const pendingJobsOfLabel = await jobRepository.find({
                where: { label, status: 'pending' },
                order: { updateAt: 'ASC' }
            })
            
            for (const job of pendingJobsOfLabel) {
                subscriberQueue.push({ ...job, data: job.data as Job["data"] })
            }
        }
    
    
    
        pubsub.addListener(label, (job: Job) => {
            subscriberQueue.push(job)
        })
    
    }


}