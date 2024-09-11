import { EventEmitter } from "node:events"

import { Repository } from "typeorm"
import { z } from "zod"
import { Logger } from "pino"

import { ClientIpUpdatedEvent } from "@packages/events/ddns-gateway.events"
import { DdnsGatewayEvent } from "@packages/events/ddns-gateway.events"
import { Client } from "@server/domains/ddns-gateway/models/Client"
import { Event } from "@server/domains/ddns-gateway/models/Event"
import { AppError } from "../../_errors/AppError"
import { EventBusService } from "../service-interfaces"
import { persistDomainEvent } from "../helpers/event-persistence"







export type UpdateClientIpCommandPayload = z.infer<typeof UpdateClientIpCommandPayload>
export const UpdateClientIpCommandPayload = z.object({
    clientId: z.string().uuid(),
    ips: z.array(z.string().ip()).min(1)
})


export function makeUpdateClientIpExecutor(
    logger: Logger,
    clientRepository: Repository<Client>, 
    eventBusService: EventBusService
) {

    return async function execUpdateClientIp (cid: string, payload: UpdateClientIpCommandPayload) : Promise<{ status: number, message: string }> {

        try {

            return await clientRepository.manager.transaction(async tm => {

                const validation = UpdateClientIpCommandPayload.safeParse(payload)

                if (!validation.success) {
                    throw new AppError(400, "fatal", validation.error)
                }



                const client = await tm.findOne(Client, { where: { id: payload.clientId } })

                if (!client) {
                    throw new AppError(404, "fatal", "client not found")
                }



                const events = await tm.createQueryBuilder(Event, "event")
                    .where("JSON_EXTRACT(event.data, '$.clientId') = :clientId", { clientId: client.id })
                    .orderBy("event.sequence", "DESC")
                    .take(1)
                    .getMany()

                const lastEvent = events[0];

                let ipChanged = !lastEvent

                if (lastEvent) {

                    const evClientIpUpdatedValidation = ClientIpUpdatedEvent.safeParse({
                        name: "client-ip-updated",
                        data: lastEvent.data
                    })

                    if (!evClientIpUpdatedValidation.success) {
                        throw new AppError(500, "911", evClientIpUpdatedValidation.error)
                    }
                    
                    for (const ip of payload.ips) {
                        !evClientIpUpdatedValidation.data.data.ips.includes(ip) && (ipChanged = true)
                    }

                }


                if (!ipChanged) {
                    return {
                        status: 200,
                        message: "nochg"
                    }
                }



                const event: DdnsGatewayEvent = {
                    name: "client-ip-updated",
                    cid,
                    data: {
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