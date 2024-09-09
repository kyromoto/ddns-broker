import { Writable } from "node:stream"
import crypto from "node:crypto"

import pino from "pino"

import { cleanupDatabase, initDatabase } from "@server/test-utils/utils"

import { AppDataSource } from "@server/database"
import { Password } from "@server/domains/ddns-gateway/models/Password"
import { Event } from "@server/domain/models/Event"
import { User } from "@server/domains/ddns-gateway/models/User"

import { UserAddedEvent } from "../../../../../../packages/events/ddns-gateway/user-added-event"
import { AddUserCommandPayload, makeAddUserCommand as makeAddUserUC } from "./add-user"
import { Repository } from "typeorm"



describe("exec add-user-command", () => {

    const logger = pino(new Writable({ write: () => null }))
    const cid = crypto.randomUUID()
    
    let userRepository: Repository<User>
    let passwordRepository: Repository<Password>
    let eventRepository: Repository<Event>

    const addUserPayload: AddUserCommandPayload = {
        username: "testuser",
        password: "password12!",
        email: "test@example.com",
        firstName: "test",
        lastName: "test",
    }

    let cmd: ReturnType<typeof makeAddUserUC>


    beforeAll(async () => {

        await initDatabase(AppDataSource)

        userRepository = AppDataSource.getRepository(User)
        passwordRepository = AppDataSource.getRepository(Password)
        eventRepository = AppDataSource.getRepository(Event)

        cmd = makeAddUserUC(logger, userRepository, passwordRepository)
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