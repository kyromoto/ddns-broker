import { Logger } from "pino";
import { Job } from "../models/Job";
import { ProcessorRegistryService } from "../service-interfaces";
import { EntityManager } from "typeorm";
import { AppError } from "@server/domains/_errors/AppError";


export function makeProcessProcessorJobUC(enetityManager: EntityManager, processorRegistry: ProcessorRegistryService, logger: Logger) {

    return async function (jobId: string, cid: string) {

        const job = await enetityManager.findOne(Job, {
            where: { id: jobId },
            relations: { client: true }
        })

        if (!job) {
            throw new AppError(404, "job not found")
        }

        if (!processorRegistry.hasProcessor(job.data.processor.name)) {
            
            await enetityManager.save(Job, {
                ...job,
                status: "failed"
            })

            throw new AppError(500, `processor ${job.data.processor.name} not found`)

        }
        
        processorRegistry.queueJob(job.data.processor.name, job, cid)
        
    }

}