import { Writable } from "node:stream"
import crypto from "node:crypto"

import pino from "pino"

import { initDatabase, cleanupDatabase } from "@server/_test/utils"

import { AppDataSource } from "@server/database"
import { Client } from "@server/domains/ddns-gateway/models/Client"
import { Event } from "@server/domains/ddns-gateway/models/Event"
import { User } from "@server/domains/ddns-gateway/models/User"

import { makeUpdateClientIpExecutor, UpdateClientIpCommandPayload } from "./update-client-ip"
import { AddClientCommandPayload } from "./add-client"
import { generatePasswordHashAndSalt } from "../utils"
import { Password } from "@server/domains/ddns-gateway/models/Password"
import { Repository } from "typeorm"


describe ("exec update-client-ip-command", () => {

    const logger = pino(new Writable({ write: () => null }))

    const cid = crypto.randomUUID()

    const userHash = generatePasswordHashAndSalt("password12!")
    const clientHash = generatePasswordHashAndSalt("password12!")

    let clientRepository: Repository<Client>
    let userRepository: Repository<User>
    let passwordRepository: Repository<Password>
    let eventRepository: Repository<Event>

    let user: User
    let client: Client
    let userPassword: Password
    let clientPassword: Password

    let updateClientIpPayload: UpdateClientIpCommandPayload

    let cmd: ReturnType<typeof makeUpdateClientIpExecutor>    


    beforeAll(async () => {

        await initDatabase(AppDataSource)

        userRepository = AppDataSource.getRepository(User)
        clientRepository = AppDataSource.getRepository(Client)
        eventRepository = AppDataSource.getRepository(Event)
        passwordRepository = AppDataSource.getRepository(Password)

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

        cmd = makeUpdateClientIpExecutor(logger, clientRepository)

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