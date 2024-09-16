import { Writable } from "node:stream"

import { Repository } from "typeorm"
import crypto from "node:crypto"
import pino from "pino"

import { initDatabase, cleanupDatabase } from "@server/_test/utils"
import { makeEventBusService } from "@server/event-bus"
import { AppDataSource } from "@server/database"
import { Password } from "@server/domains/ddns-gateway/entities/Password"
import { Client } from "@server/domains/ddns-gateway/entities/Client"
import { Event } from "@server/domains/ddns-gateway/entities/Event"
import { User } from "@server/domains/ddns-gateway/entities/User"

import { EventBusService } from "../services/event-bus.service"
import { generatePasswordHashAndSalt } from "../utils/password-util"
import { makeReportClientIpUpdateCommand, UpdateClientIpCommandPayload } from "./report-client-ip-update"




describe ("exec update-client-ip-command", () => {

    const logger = pino(new Writable({ write: () => null }))

    const cid = crypto.randomUUID()

    const userHash = generatePasswordHashAndSalt("password12!")
    const clientHash = generatePasswordHashAndSalt("password12!")

    let clientRepository: Repository<Client>
    let userRepository: Repository<User>
    let passwordRepository: Repository<Password>
    let eventRepository: Repository<Event>
    let eventBusService: EventBusService

    let user: User
    let client: Client
    let userPassword: Password
    let clientPassword: Password

    let updateClientIpPayload: UpdateClientIpCommandPayload

    let cmd: ReturnType<typeof makeReportClientIpUpdateCommand>    


    beforeAll(async () => {

        await initDatabase(AppDataSource)

        userRepository = AppDataSource.getRepository(User)
        clientRepository = AppDataSource.getRepository(Client)
        eventRepository = AppDataSource.getRepository(Event)
        passwordRepository = AppDataSource.getRepository(Password)
        eventBusService = makeEventBusService(logger)

        userPassword = passwordRepository.create({...userHash})
        clientPassword = passwordRepository.create({...clientHash})
        
        user = userRepository.create({
            id: crypto.randomUUID(),
            username: "testuser",
            password: userPassword,
            email: "test@example.com",
            firstName: "test",
            lastName: "test",
        })

        client = clientRepository.create({
            id: crypto.randomUUID(),
            clientname: "testclient",
            password: clientPassword,
            user
        })

        updateClientIpPayload = {
            clientId: client.id,
            ips: ["192.168.1.1", "2001:0db8:85a3:0000:0000:8a2e:0370:7334"]
        }

        cmd = makeReportClientIpUpdateCommand(logger, clientRepository, eventBusService)

        await userRepository.save(user)
        await clientRepository.save(client)
        
    })

    afterAll(async () => {
        await cleanupDatabase(AppDataSource)
    })


    afterEach(async () => {
        await eventRepository.delete({ name: "client-ip-updated" })
    })



    test ("client ips should not be updated with unkown client", async () => {
        const { status, message } = await cmd(cid, { ...updateClientIpPayload, clientId: crypto.randomUUID() })
        
        expect(status).toBe(404)
        expect(message).toBe("fatal")
    })

    test ("client ips should not be updated with no ips", async () => {
        const { status, message } = await cmd(cid, { ...updateClientIpPayload, ips: [] })

        expect(status).toBe(400)
        expect(message).toBe("fatal")
    })

    test ("client ips should be updated with one ipv4", async () => {
        const { status, message } = await cmd(cid, {...updateClientIpPayload, ips: [updateClientIpPayload.ips[0]]})

        expect(status).toBe(200)
        expect(message).toBe("good")
    })

    test ("client ips should be updated with one ip v6", async () => {
        const { status, message } = await cmd(cid, {...updateClientIpPayload, ips: [updateClientIpPayload.ips[1]]})

        expect(status).toBe(200)
        expect(message).toBe("good")
    })

    test ("client ips should not be updated twice because of nochg", async () => {

        const resGood = await cmd(cid, { ...updateClientIpPayload })
        expect(resGood.status).toBe(200)
        expect(resGood.message).toBe("good")


        const resNochg = await cmd(cid, { ...updateClientIpPayload })
        expect(resNochg.status).toBe(200)
        expect(resNochg.message).toBe("nochg")
    })

})