import { Logger } from "pino"
import { Repository } from "typeorm"

import { User } from "../models/User"



export function makeIsUserAuthenticatedQuery(logger: Logger, userRepository: Repository<User>) {

    return async (cid: string, username: string, password: string) => {

        const user = await userRepository.findOne({
            where: { username },
            relations: { password: true }
        })

        if (!user) {
            return false
        }

        return user.isCorrectPassword(password)

    }

}