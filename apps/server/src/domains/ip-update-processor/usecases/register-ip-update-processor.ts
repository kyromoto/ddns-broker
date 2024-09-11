import type { queueAsPromised } from "fastq"
import fastq from "fastq"
import { EntityManager } from "typeorm"
import { ZodType } from "zod"
import { Logger } from "pino"


import { Job } from "../models/Job"
import { EventBusService, ProcessorRegistryService } from "../service-interfaces"
import { IpUpdateProcessor, IpUpdateProcessorApi, IpUpdateProcessorLogger, IpUpdateProcessorResult } from "../processor-Interfaces"
import { AppError } from "@server/domains/_errors/AppError"
import { ProcessorConfig } from "../models/Processors"
import { IpUpdateProcessorEvent } from "@packages/events/ip-update-processor.events"
import { persistDomainEvent } from "../helpers/event-persistence"


const apiFactory = (job: Job, processor: IpUpdateProcessor<any>, processorConfig: ProcessorConfig, logger: IpUpdateProcessorLogger) : IpUpdateProcessorApi<any> => {
    return {
        getCorrelationId: function (): string {
            return job.id
        },
        getLogger: function (): IpUpdateProcessorLogger {
            return logger
        },
        getProcessorConfig: function (): any {
            return processorConfig.config
        },
        getProcessorSchema: function (): ZodType<any> {
            return processor.config.schema
        },
        getClientIps: function (): string[] {
            return job.data.ips
        }
    }
}



export function makeRegisterIpUpdateProcessorUC(entityManager: EntityManager, eventBus: EventBusService, processorRegistry: ProcessorRegistryService, logger: Logger) {

    return async function (processsor: IpUpdateProcessor<any>, concurrency: number = 1) : Promise<void> {

        const worker = async (data: { jobId: string, correlationId: string }) => {

            const { jobId, correlationId } = data
            const workerLogger = logger.child({ correlationId })

            try {
                
                const job = await entityManager.findOne(Job, { where: { id: jobId } })

                if (!job) {
                    throw new AppError(404, "job not found")
                }



                const processorConfig = await entityManager.findOne(ProcessorConfig, { where: { id: job.data.processor.id } })
                
                if (!processorConfig) {
                    throw new AppError(404, "processor config not found")
                }
                
                

                const api = apiFactory(job, processsor, processorConfig, workerLogger)
                
                const evRunning: IpUpdateProcessorEvent = {
                    name: "job-running",
                    cid: job.id,
                    data: {
                        jobId: job.id
                    }
                }

                await entityManager.transaction(async tm => {
                    await tm.update(Job, { id: job.id }, { status: "running" })
                    await persistDomainEvent(tm, evRunning)
                })

                await eventBus.publish(evRunning, correlationId)



                const processorResult = await processsor.exec(api)

                if (processorResult.status === "failed") {
                    workerLogger.error(processorResult.error.message, processorResult.error.data)
                }


                let evEnded: IpUpdateProcessorEvent


                switch (processorResult.status) {
                    
                    case "completed": {
                        evEnded = {
                            name: "job-completed",
                            cid: job.id,
                            data: {
                                jobId: job.id
                            }
                        }

                        break
                    }
                        
                    case "failed": {
                        evEnded = {
                            name: "job-failed",
                            cid: job.id,
                            data: {
                                jobId: job.id,
                                error: processorResult.error.message
                            }

                        }

                        break
                    }

                    default: {
                        throw new AppError(500, "invalid processor result")
                    }
                }

                await entityManager.transaction(async tm => {
                    await tm.update(Job, { id: job.id }, { status: processorResult.status })
                    await persistDomainEvent(tm, evEnded)
                })

                
                await eventBus.publish(evEnded, correlationId)
            
            } catch (error: any) {

                workerLogger.error(error)

                if (error instanceof AppError) {
                    throw error
                }

                
                throw new AppError(500, "processor worker error", error)
            }
        }


    
        const subscriberQueue: queueAsPromised<{ jobId: string, correlationId: string }> = fastq.promise(worker, concurrency)

    
        // if is first subscriber, push all pending jobs from store
        
        if (!processorRegistry.hasProcessor(processsor.name)) {
            
            const pendingsJobs = await entityManager.createQueryBuilder(Job, "job")
                .where("JSON_EXTRACT(job.data, '$.processor.name') = :processorName AND job.status = 'pending'", { processorName: processsor.name })
                .orderBy("job.updatedAt", "DESC")
                .getMany()
            
            for await (const job of pendingsJobs) {
                await subscriberQueue.push({
                    jobId: job.id,
                    correlationId: job.id
                })
            }
        }
    
        // register processor
    
        processorRegistry.register(processsor.name, async (name, job, cid) => {
            await subscriberQueue.push({
                jobId: job.id,
                correlationId: cid
            })
        })
    
    }

}