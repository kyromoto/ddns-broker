import { z } from "zod"

import { DynipUpdateReportingEvent } from "./dynip-update-reporting.events"
import { DynipUpdateProcessingEvent } from "./dynip-update-processing.events"
import { IamEvent } from "./iam.events"

export type ApplicationEvent = z.infer<typeof DynipUpdateReportingEvent | typeof DynipUpdateProcessingEvent | typeof IamEvent>
export const ApplicationEvent = z.discriminatedUnion("name", [
    ...DynipUpdateReportingEvent.options,
    ...DynipUpdateProcessingEvent.options,
    ...IamEvent.options
])