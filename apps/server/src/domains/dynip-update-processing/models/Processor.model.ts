import { z } from "zod"

import { Client } from "./Client.model"



export type Processor = {
    id: string
    name: string
    version: string
    config: z.ZodTypeAny
    client: Client
    createAt: Date
    updateAt: Date
}