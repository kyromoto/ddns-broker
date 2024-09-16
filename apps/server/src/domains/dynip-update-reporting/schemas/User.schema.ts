import { EntitySchema } from "typeorm"
import { User } from "../models/User.model"

export const UserSchema = new EntitySchema<User>({
    name: "User",
    columns: {
        id: {
            type: String,
            primary: true
        },
        createAt: {
            type: Date,
            createDate: true
        },
        updateAt: {
            type: Date,
            updateDate: true
        }
    },
    relations: {
        clients: {
            type: "one-to-many",
            target: "Client"
        }
    }
})