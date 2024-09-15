import { EntitySchema } from "typeorm"
import { Job } from "../models/Job.model"


export const JobSchema = new EntitySchema<Job>({
    name: "Job",
    columns: {
        id: {
            type: "text",
            primary: true,
            generated: "uuid"
        },
        status: {
            type: "text"  
        },
        data: {
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