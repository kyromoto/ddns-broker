import { Request, Response, NextFunction } from "express"

import { makeReportClientIpUpdateCommand } from "@server/domains/dynip-update-reporting/usecases/report-client-ip-update"
import { AppError } from "@server/domains/_errors/AppError"





export function makeReportClientIpUpdateController(usecase: ReturnType<typeof makeReportClientIpUpdateCommand>) {
    
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