import { Request, Response, NextFunction } from "express"
import { Repository } from "typeorm"

import { Client } from "@server/domains/ddns-gateway/entities/Client"
import { makeUpdateClientIpExecutor } from "@server/domains/ddns-gateway/usecases/update-client-ip"





export function makeUpdateClientIpCmdController(usecase: ReturnType<typeof makeUpdateClientIpExecutor>) {
    
    return async (req: Request, res: Response, next: NextFunction) => {

        const logger = req.log.child({ command: "update-client-ip" })
        const ips = []

        try {

            if (!req.clientId) {
                return res.status(500).send("911")
            }

            const { ipv4, ipv6 } = req.params

            ipv4 && ips.push(ipv4)
            ipv6 && ips.push(ipv6)
            
            const { status, message } = await usecase(req.id.toString(), { clientId: req.clientId, ips: ips })

            return res.status(status).send(message)

        } catch (err) {
            logger.error(err)
            return res.status(500).send("911")
        }

    }

}