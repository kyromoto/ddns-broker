import { ApplicationEvent } from "@packages/events"
import { DynipUpdateProcessingEvent } from "@packages/events/dynip-update-processing.events"

export interface EventBusService {
    publish(event: DynipUpdateProcessingEvent, cid: string): Promise<boolean>
    publish(events: DynipUpdateProcessingEvent[], cid: string): Promise<boolean>
    subscribe<E extends ApplicationEvent>(event: E['name'], handler: (event: E) => Promise<void>): Promise<void>
}