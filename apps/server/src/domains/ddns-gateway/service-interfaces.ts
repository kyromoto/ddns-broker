import { DdnsGatewayEvent } from "@packages/events/ddns-gateway.events"

export interface EventBusService {
    publish(event: DdnsGatewayEvent, cid: string): Promise<boolean>
}