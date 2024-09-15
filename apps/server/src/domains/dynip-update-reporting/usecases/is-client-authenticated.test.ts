import { Writable } from "node:stream"
import crypto from "node:crypto"

import { Repository } from "typeorm"
import pino from "pino"

import { AppDataSource } from "@server/database"
import { initDatabase } from "@server/_test/utils"

import { User } from "@server/domains/ddns-gateway/entities/User"
import { Client } from "@server/domains/ddns-gateway/entities/Client"
import { Password } from "@server/domains/ddns-gateway/entities/Password"

import { makeIsClientAuthenticatedQuery } from "./is-client-authenticated"
import { generatePasswordHashAndSalt } from "../utils/password-util"



describe ("authenticate-client", () => {

    const cid = crypto.randomUUID()

    const userName = "testuser"
    const userPass = "password12!"

    const clientName = "testclient"
    const clientPass = "password00?"

    const logger = pino(new Writable({ write: () => null }))

    let userRepository: Repository<User>
    let clientRepository: Repository<Client>
    let passwordRepository: Repository<Password>
    let user: User
    let cmd: ReturnType<typeof makeIsClientAuthenticatedQuery>



    beforeAll(async () => {
        
        await initDatabase(AppDataSource)

        userRepository = AppDataSource.getRepository(User)
        clientRepository = AppDataSource.getRepository(Client)
        passwordRepository = AppDataSource.getRepository(Password)

        cmd = makeIsClientAuthenticatedQuery(logger, clientRepository)


        user = await userRepository.save({
            username: userName,
            password: passwordRepository.create(generatePasswordHashAndSalt(userPass)),
            email: "test@example.com",
            firstName: "test",
            lastName: "test",
            clients: [
                clientRepository.create({
                    clientname: clientName,
                    password: passwordRepository.create(generatePasswordHashAndSalt(clientPass))
                })
            ]
        })

        await 


        await userRepository.save(user)

    })



    test("client with unkown clientname should not be authenticated", async () => {
        await expect(cmd(cid, { clientname: "unkown", password: clientPass})).resolves.toBe(false)
    })


    test("client with wrong password should not be authenticated", async () => {
        await expect(cmd(cid, { clientname: clientName, password: "password?123"})).resolves.toBe(false)
    })


    test("client with correct password should be authenticated", async () => {
        await expect(cmd(cid, { clientname: clientName, password: clientPass})).resolves.toBe(true)
    })

})