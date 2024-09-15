import 'reflect-metadata'

import { DataSource, EntitySchema } from "typeorm"

import iam from "@server/domains/iam/schemas"
import dynipUpdateReporting from "@server/domains/dynip-update-reporting/schemas"
import dynipUpdateProcessing from "@server/domains/dynip-update-processing/schemas"

import * as env from "@server/env"


const entities: EntitySchema[] = []


export const AppDataSource: DataSource = new DataSource({
    type: "sqlite",
    database: env.SQLITE_DB,
    synchronize: true,
    logging: ["error"],
    entities: [
        iam.UserSchema,
        iam.RoleSchema,

        dynipUpdateReporting.ClientSchema,
        
        dynipUpdateProcessing.ProcessorSchema,
        dynipUpdateProcessing.JobSchema,
        dynipUpdateProcessing.ClientSchema

    ],
    // migrations: ["src/database/migrations/*.ts"],
    // subscribers: ["src/database/subscribers/*.ts"],
});