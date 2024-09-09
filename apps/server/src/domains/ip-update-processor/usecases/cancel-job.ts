import { Repository } from "typeorm"
import { Job } from "../types"

export function makeCancelJob(jobRepository: Repository<Job>) {
    
    return async function (jobId: string) {

        const job = await jobRepository.findOne({ where: { id: jobId } })

        if (!job) {
            return false
        }

    }

}