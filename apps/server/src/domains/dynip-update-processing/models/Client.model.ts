import { Processor } from "./Processor.model"
import { Job } from "./Job.model"



export class Client {
    id: string
    jobs: Job[]
    processors: Processor[]
    createAt: Date
    updateAt: Date
}