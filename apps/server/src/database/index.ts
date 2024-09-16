// import 'reflect-metadata'

import { DataSource, EntitySchema } from "typeorm"

import * as env from "@server/env"


const entities: EntitySchema[] = []


export const AppDataSource: DataSource = new DataSource({
    type: "sqlite",
    database: env.SQLITE_DB,
    synchronize: true,
    logging: ["error"],
    entities,
    // migrations: ["src/database/migrations/*.ts"],
    // subscribers: ["src/database/subscribers/*.ts"],
});




export function registerSchemas(schemas: EntitySchema[]) {
    entities.push(...schemas)
}