import { z } from "zod"

import { IpUpdateProcessor, IpUpdateProcessorApi } from "@server/domains/ip-update-processor/processor-Interfaces"

import { version } from "./package.json"

const DomainRegex = new RegExp("^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$");

type InwxDnsExecutorConfig = z.infer<typeof InwxDnsExecutorConfig>
const InwxDnsExecutorConfig = z.object({
    domain: z.string().regex(DomainRegex, "domain is not valid"),
    username: z.string(),
    password: z.string()
})


const InwxDnsProcessor: IpUpdateProcessor<InwxDnsExecutorConfig> = {
    name: "inwx-dns",
    version: version,
    config: {
        schema: InwxDnsExecutorConfig
    },
    exec : async (api: IpUpdateProcessorApi<InwxDnsExecutorConfig>) => {

        const logger = api.getLogger()
        const config = api.getProcessorConfig()
        const schema = api.getProcessorSchema()
        const correlationId = api.getCorrelationId()
        const ips = api.getClientIps()
        

        return {
            status: "failed",
            error: {
                message: "not implemented"
            }
        }

    }
}



export default InwxDnsProcessor