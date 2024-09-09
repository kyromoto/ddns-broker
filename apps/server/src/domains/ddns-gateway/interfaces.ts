import { DdnsGatewayEvent } from "@packages/events/ddns-gateway";

export interface EventBusService {
    publish(event: DdnsGatewayEvent): Promise<void>
}