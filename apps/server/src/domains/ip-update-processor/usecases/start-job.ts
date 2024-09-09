import EventEmitter from "node:events"

import { Repository } from "typeorm"

import { Job, Task } from "../types"



export function makeExecuteJob(jobRepository: Repository<Job>, pubsub: EventEmitter) {

    return async function (task: Task) {

        const validation = Task.safeParse(task)
    
        if (!validation.success) {
            throw new Error("invalid task")
        }
    
        const job : Job = {
            id: crypto.randomUUID(),
            status: 'pending',
            ...validation.data
        }
        
        if (pubsub.eventNames().includes(job.label)) {
            throw new Error(`no subscribers for ${job.label}`)
        }
    
        await jobRepository.save(job)
    
        pubsub.emit(job.label, job)
    
        return job
    }

}