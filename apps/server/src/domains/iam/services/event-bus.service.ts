import { IamEvent } from "@packages/events/iam.events";

export interface EventBusService {
    publish(event: IamEvent, cid: string): Promise<boolean>
}