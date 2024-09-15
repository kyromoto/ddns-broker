import { User } from "./User"

export type Role = {
    id: string
    name: string
    users: User[]
}