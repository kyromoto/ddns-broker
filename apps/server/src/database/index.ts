import 'reflect-metadata'

import { DataSource, EntitySchema } from "typeorm"

import { Event } from "../domains/ddns-gateway/models/Event"
import { User } from "../domains/ddns-gateway/models/User"
import { Password } from "../domains/ddns-gateway/models/Password"
import { Client } from "../domains/ddns-gateway/models/Client"
import * as env from "@server/env"


const entities: EntitySchema[] = []


export const AppDataSource: DataSource = new DataSource({
    type: "sqlite",
    database: env.SQLITE_DB,
    synchronize: true,
    logging: ["error"],
    entities: [
        Client,
        User,
        Password,
        Event
    ],
    // migrations: ["src/database/migrations/*.ts"],
    // subscribers: ["src/database/subscribers/*.ts"],
});