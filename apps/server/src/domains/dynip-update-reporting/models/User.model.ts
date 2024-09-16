import { Client } from "./Client.model"

export class User {
    id: string
    clients: Client[]
    createAt: Date
    updateAt: Date
}