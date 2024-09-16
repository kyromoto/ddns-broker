import crypto from "node:crypto"
import { Writable } from "node:stream"

import pino from "pino"
import { Repository } from "typeorm"

import { cleanupDatabase, initDatabase } from "@server/_test/utils"
import { ClientAddedEvent } from "@packages/events/ddns-gateway.events"

import { AppDataSource } from "@server/database"
import { Password } from "@server/domains/ddns-gateway/entities/Password"
import { Client } from "@server/domains/ddns-gateway/entities/Client"
import { Event } from "@server/domains/ddns-gateway/entities/Event"
import { User } from "@server/domains/ddns-gateway/entities/User"


import { EventBusService } from "../services/event-bus.service"
import { generatePasswordHashAndSalt } from "../utils/password-util"
import { AddClientCommandPayload, makeAddClientCommand } from "./add-client"
import { makeEventBusService } from "@server/event-bus"





describe("exec add-client-command", () => {

    const logger = pino(new Writable({ write: () => null }))
    
    const userHash = generatePasswordHashAndSalt("password12!")
    const cid = crypto.randomUUID()

    let clientRepository: Repository<Client>
    let userRepository: Repository<User>
    let passwordRepository: Repository<Password>
    let eventRepository: Repository<Event>
    let eventBusService: EventBusService

    let user: User
    let addClientPayload: AddClientCommandPayload

    let cmd: ReturnType<typeof makeAddClientCommand>
    
    
    beforeAll(async () => {

        await initDatabase(AppDataSource)

        clientRepository = AppDataSource.getRepository(Client)
        userRepository = AppDataSource.getRepository(User)
        passwordRepository = AppDataSource.getRepository(Password)
        eventRepository = AppDataSource.getRepository(Event)
        eventBusService = makeEventBusService(logger)
    
        user = userRepository.create({
            id: crypto.randomUUID(),
            username: "testuser",
            password: passwordRepository.create({...userHash}),
            email: "test@example.com",
            firstName: "test",
            lastName: "test",
        })
    
        addClientPayload = {
            name: "testclient",
            password: "password12!",
            userId: user.id
        }

        cmd = makeAddClientCommand(logger, clientRepository, passwordRepository, eventBusService)

        await userRepository.save(user)

    })

    afterAll(async () => {
        await cleanupDatabase(AppDataSource)
    })


    test ("add client with invalid username (too short)", async () => {
        await expect(cmd(cid, { ...addClientPayload, name: "test" })).rejects.toThrow()
    })

    test ("add client with invalid username (invalid characters)", async () => {
        await expect(cmd(cid, { ...addClientPayload, name: "test test" })).rejects.toThrow()
    })

    test ("add client with invalid password (too short)", async () => {
        await expect(cmd(cid, { ...addClientPayload, password: "pass" })).rejects.toThrow()
    })

    test ("add client with invalid password (invalid characters)", async () => {
        await expect(cmd(cid, { ...addClientPayload, password: "pass word" })).rejects.toThrow()
    })

    test ("add client for invalid user", async () => {
        await expect(cmd(cid, { ...addClientPayload, userId: crypto.randomUUID() })).rejects.toThrow()
    })

    test ("add client success", async () => {
        await expect(cmd(cid, { ...addClientPayload })).resolves.not.toThrow()
    })

    test ("check domain event", async () => {

        const client = await clientRepository.findOne({
            where: { clientname: addClientPayload.name },
            relations: { user: true }
        })
        
        expect(client).not.toBeNull()



        const events = await eventRepository.find({
            order: { sequence: "DESC" }
        })

        expect(events.length).toBe(1)
        expect(events[0].sequence).toBe(1)




        const validation = ClientAddedEvent.safeParse(events[0])

        expect(validation.success).toBeTruthy()



        expect(validation.data?.data.clientId).toBe(client?.id)
        expect(validation.data?.data.userId).toBe(client?.user.id)

    })
})