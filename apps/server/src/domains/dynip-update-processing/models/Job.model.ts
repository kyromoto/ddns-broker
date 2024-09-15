import { Client } from "./Client.model"
import { JobStatus } from "../types"



export type Job = {
    id: string
    status: JobStatus
    data: {
        ips: string[],
        processor: {
            id: string,
            name: string,
            version: string
        }
    }
    client: Client
    createAt: Date
    updateAt: Date
}