import { Writable } from "node:stream"
import crypto from "node:crypto"

import { Repository } from "typeorm"
import pino from "pino"

import { initDatabase } from "@server/_test/utils"
import { AppDataSource } from "@server/database"

import { User } from "@server/domains/ddns-gateway/models/User"
import { Password } from "@server/domains/ddns-gateway/models/Password"

import { makeIsUserAuthenticatedQuery } from "./is-user-authenticated"
import { generatePasswordHashAndSalt } from "../utils"




describe ("authenticate-user", () => {

    const cid = crypto.randomUUID()

    const userName = "testuser"
    const userPass = "password12!"

    const logger = pino(new Writable({ write: () => null }))

    let userRepository: Repository<User>
    let passwordRepository: Repository<Password>
    let user: User
    let cmd: ReturnType<typeof makeIsUserAuthenticatedQuery>



    beforeAll(async () => {
        
        await initDatabase(AppDataSource)

        userRepository = AppDataSource.getRepository(User)
        passwordRepository = AppDataSource.getRepository(Password)

        cmd = makeIsUserAuthenticatedQuery(logger, userRepository)


        user = await userRepository.save({
            username: userName,
            password: passwordRepository.create(generatePasswordHashAndSalt(userPass)),
            email: "test@example.com",
            firstName: "test",
            lastName: "test",
        })


        await userRepository.save(user)

    })



    test("user with unkown username should not be authenticated", async () => {
        await expect(cmd(cid, "unkown", userPass)).resolves.toBe(false)
    })


    test("user with wrong password should not be authenticated", async () => {
        await expect(cmd(cid, userName, "password?123")).resolves.toBe(false)
    })


    test("user with correct password should be authenticated", async () => {
        await expect(cmd(cid, userName, userPass)).resolves.toBe(true)
    })


})