import { Role } from "./Role"


export class User {
    id: string
    name: string
    password: {
        hash: string
        salt: string
        version: number
    }
    email: string
    roles: Role[]
    createAt: Date
    updateAt: Date
}




export function createUser (overrides: Partial<User> = {}) {

    const user: User = new User()

    user.name       = overrides.name        || user.name
    user.password   = overrides.password    || user.password
    user.email      = overrides.email       || user.email
    user.roles      = overrides.roles       || user.roles

    return user
}