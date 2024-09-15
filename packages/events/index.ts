import { z } from "zod"
import { DynipUpdateRegisteringEvent } from "./dynip-update-registering.events"
import { DynipUpdateProcessingEvent } from "./dynip-update-processing.events"

export type ApplicationEvent = z.infer<typeof DynipUpdateRegisteringEvent | typeof DynipUpdateProcessingEvent>
export const ApplicationEvent = z.discriminatedUnion("name", [
    ...DynipUpdateRegisteringEvent.options,
    ...DynipUpdateProcessingEvent.options
])