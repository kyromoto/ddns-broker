import { Writable } from "node:stream"
import crypto from "node:crypto"

import { Repository } from "typeorm"
import pino from "pino"

import { UserAddedEvent } from "@packages/events/ddns-gateway.events"
import { cleanupDatabase, initDatabase } from "@server/_test/utils"
import { makeEventBusService } from "@server/event-bus"
import { AppDataSource } from "@server/database"
import { Password } from "@server/domains/ddns-gateway/entities/Password"
import { Event } from "@server/domains/ddns-gateway/entities/Event"
import { User } from "@server/domains/ddns-gateway/entities/User"

import { AddUserCommandPayload, makeAddUserCommand } from "./add-user"

import { EventBusService } from "../service-interfaces"






describe("exec add-user-command", () => {

    const logger = pino(new Writable({ write: () => null }))
    const cid = crypto.randomUUID()
    
    let userRepository: Repository<User>
    let passwordRepository: Repository<Password>
    let eventRepository: Repository<Event>
    let eventBusService: EventBusService

    const addUserPayload: AddUserCommandPayload = {
        username: "testuser",
        password: "password12!",
        email: "test@example.com",
        firstName: "test",
        lastName: "test",
    }

    let cmd: ReturnType<typeof makeAddUserCommand>


    beforeAll(async () => {

        await initDatabase(AppDataSource)

        userRepository = AppDataSource.getRepository(User)
        passwordRepository = AppDataSource.getRepository(Password)
        eventRepository = AppDataSource.getRepository(Event)
        eventBusService = makeEventBusService(logger)

        cmd = makeAddUserCommand(logger, userRepository, passwordRepository, eventBusService)
    })

    afterAll(async () => {
        await cleanupDatabase(AppDataSource)
    })


    test ("add user with invalid username (too short)", async () => {
        await expect(cmd(cid, { ...addUserPayload, username: "test" })).rejects.toThrow()
    })

    test ("add user with invalid username (invalid characters)", async () => {
        await expect(cmd(cid, { ...addUserPayload, username: "test test" })).rejects.toThrow()
    })

    test ("add user with invalid password (too short)", async () => {
        await expect(cmd(cid, { ...addUserPayload, password: "pass" })).rejects.toThrow()
    })

    test ("add user with invalid password (invalid characters)", async () => {
        await expect(cmd(cid, { ...addUserPayload, password: "pass word" })).rejects.toThrow()
    })

    test ("add user with invalid email", async () => {
        await expect(cmd(cid, { ...addUserPayload, email: "test" })).rejects.toThrow()
    })

    test ("add user success", async () => {
        await expect(cmd(cid, addUserPayload)).resolves.not.toThrow()
    })


    test ("check domain event", async () => {

        const user = await userRepository.findOne({
            where: { username: addUserPayload.username }
        })

        expect(user).not.toBeNull()
        


        const events = await eventRepository.find({
            order: { sequence: "DESC" },
        })

        expect(events.length).toBe(1)
        expect(events[0].sequence).toBe(1)



        const validation = UserAddedEvent.safeParse(events[0])

        expect(validation.success).toBeTruthy()



        expect(validation.data?.name).toBe("user-added")
        expect(validation.data?.data.userId).toBe(user?.id)

    })
})