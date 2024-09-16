import { EntitySchema } from "typeorm";
import { Client } from "../models/Client.model";

export const ClientSchema = new EntitySchema<Client>({
    name: "Client",
    columns: {
        id: {
            type: "text",
            primary: true,
            generated: "uuid"
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
        jobs: {
            type: "one-to-many",
            target: "Job"
        },
        processors: {
            type: "one-to-many",
            target: "ProcessorConfig"
        }
    }
})