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
        name: {
            type: "text"
        },
        password: {
            type: "simple-json",
        },
        userId: {
            type: "text"
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
    uniques: [
        {
            columns: ["name", "userId"]
        }
    ]
})