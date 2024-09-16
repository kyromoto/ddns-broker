import { ClientIpUpdatedEvent, DynipUpdateReportingEvent } from "@packages/events/dynip-update-reporting.events"

export interface EventBusService {
    publish(event: DynipUpdateReportingEvent, cid: string): Promise<boolean>
    getAllPublishedEvents(): Promise<DynipUpdateReportingEvent[]>
    getLastPublishedClientIpHasChangedEvent(clientId: string): Promise<ClientIpUpdatedEvent | undefined>
}