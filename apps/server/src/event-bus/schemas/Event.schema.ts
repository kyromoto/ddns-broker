import { EntitySchema } from "typeorm"

import { ApplicationEvent } from "@packages/events"


export type Event = ApplicationEvent & {
    id: string
    sequence: number
    createdAt: Date
}


export const Event = new EntitySchema<Event>({
    name: "Event",
    columns: {
        id : {
            type: "text",
            primary: true,
            generated: "uuid",  
        },
        sequence: {
            type: "integer",
            unique: true
        },
        cid: {
            type: "text",
            unique: true
        },
        name: {
            type: "text"
        },
        data: {
            type: "simple-json"
        },
        createdAt: {
            type: "text",
            createDate: true
        }
    }
})