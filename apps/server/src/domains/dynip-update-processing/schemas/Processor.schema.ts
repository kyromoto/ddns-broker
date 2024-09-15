import { EntitySchema } from "typeorm"
import { Processor } from "../models/Processor.model"


export const ProcessorSchema = new EntitySchema<Processor>({
    name: "Processor",
    columns: {
        id: {
            type: "text",
            primary: true,
            generated: "uuid"
        },
        name: {
            type: "text"
        },
        version: {
            type: "text"
        },
        config: {
            type: "simple-json"
        },
        createAt: {
            type: "text",
            createDate: true
        },
        updateAt: {
            type: "text",
            updateDate: true
        }
    },
    relations: {
        client: {
            type: "many-to-one",
            target: "Client"
        }
    }
})