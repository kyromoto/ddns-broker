import crypto from "node:crypto"

import { Logger } from "pino";
import { EntityManager, Repository } from "typeorm";
import { Client } from "../models/Client";
import { Job } from "../models/Job";
import { Event } from "../models/Event";
import { AppError } from "@server/domains/_errors/AppError";
import { EventBusService, ProcessorRegistryService } from "../service-interfaces";
import { IpUpdateProcessorEvent } from "@packages/events/ip-update-processor.events";
import { persistDomainEvent } from "../helpers/event-persistence";



export function makeCreateProcessJobUpdateUC(entityManager: EntityManager, eventBusService: EventBusService, logger: Logger) {

    return async function (clientId: string, ips: string[], cid: string) {

        const events: IpUpdateProcessorEvent[] = []
        

        await entityManager.transaction(async tm => {

            const client = await tm.findOne(Client, {
                where: { id: clientId },
                relations: { processors: true }
            })

            if (!client) {
                throw new AppError(400, "client not found")
            }

            if (client.processors.length === 0) {
                throw new AppError(400, "client has no processors")
            }

            for await (const processor of client.processors) {

                const job = await tm.save(Job, {
                    id: cid,
                    client: client,
                    status: "pending",
                    data: {
                        ips : ips,
                        processor : {
                            id: processor.id,
                            name: processor.name,
                            version: processor.version
                        } 
                    }       
                })

                const event: IpUpdateProcessorEvent = {
                    name: "job-pending",
                    cid: cid,
                    data: {
                        jobId: job.id
                    }
                }
                
                await persistDomainEvent(tm, event)   

                events.push(event)

            }
        })

        await eventBusService.publish(events)

    }

}