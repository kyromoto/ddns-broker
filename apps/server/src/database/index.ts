import 'reflect-metadata'

import { DataSource, EntitySchema } from "typeorm"

import { Event } from "../domains/ddns-gateway/entities/Event"
import { User } from "../domains/ddns-gateway/entities/User"
import { Password } from "../domains/ddns-gateway/entities/Password"
import { Client } from "../domains/ddns-gateway/entities/Client"
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