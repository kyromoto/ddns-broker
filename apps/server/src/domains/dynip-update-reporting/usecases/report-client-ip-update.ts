import { z } from "zod"
import { Logger } from "pino"
import { EntityManager } from "typeorm"

import { Client } from "../models/Client.model"

import { AppError } from "../../_errors/AppError"
import { EventBusService } from "../services/event-bus.service"
import { persistDomainEvent } from "../helpers/event-persistence"

import { DynipUpdateReportingEvent } from "@packages/events/dynip-update-reporting.events"





export type UpdateClientIpCommandPayload = z.infer<typeof UpdateClientIpCommandPayload>
export const UpdateClientIpCommandPayload = z.object({
    clientId: z.string().uuid(),
    ips: z.array(z.string().ip()).min(1)
})


export function makeReportClientIpUpdateCommand(
    logger: Logger,
    entityManager: EntityManager,
    eventBusService: EventBusService
) {

    return async (cid: string, payload: UpdateClientIpCommandPayload) : Promise<{ status: number, message: string }> => {

        try {

            return await entityManager.transaction(async tm => {

                const validation = UpdateClientIpCommandPayload.safeParse(payload)

                if (!validation.success) {
                    throw new AppError(400, "fatal", validation.error)
                }



                const client = await tm.findOne(Client, {
                    where: { id: payload.clientId },
                    relations: { user: true }
                    
                })

                if (!client) {
                    throw new AppError(404, "fatal", "client not found")
                }



                // const events = await tm.createQueryBuilder(Event, "event")
                //     .where("JSON_EXTRACT(event.data, '$.clientId') = :clientId", { clientId: client.id })
                //     .orderBy("event.sequence", "DESC")
                //     .take(1)
                //     .getMany()

                const lastEvent = await eventBusService.getLastPublishedClientIpHasChangedEvent(client.id)
                const ipChanged = !(lastEvent && payload.ips.every(ip => lastEvent.data.ips.includes(ip)))


                if (!ipChanged) {
                    return {
                        status: 200,
                        message: "nochg"
                    }
                }


                const event: DynipUpdateReportingEvent = {
                    name: "client-ip-has-changed",
                    cid,
                    data: {
                        userId: client.user.id,
                        clientId: client.id,
                        ips: payload.ips
                    }
                }

                await persistDomainEvent(tm, event)
                await eventBusService.publish(event, cid)
    
                logger.info(event)


                return {
                    status: 200,
                    message: "good"
                }

            })

        } catch (error) {
            
            if (error instanceof AppError) {
                return {
                    status: error.Code,
                    message: error.Reason
                }
            }

            return {
                status: 500,
                message: "911"
            }

        }

    }

}