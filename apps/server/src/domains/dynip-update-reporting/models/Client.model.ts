import { User } from "./User.model"

export class Client {
    id: string
    name: string
    password: {
        hash: string
        salt: string
    }
    user: User
    createAt: Date
    updateAt: Date
}