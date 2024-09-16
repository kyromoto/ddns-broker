import { User } from "./User.model"

export class Role {
    id: string
    name: string
    users: User[]
}