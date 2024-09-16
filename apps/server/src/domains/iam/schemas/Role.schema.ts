import { EntitySchema } from "typeorm";
import { Role } from "../models/Role.model";

export const RoleSchema = new EntitySchema<Role>({
    name: "Role",
    columns: {
        id: {
            type: "text",
            primary: true
        },
        name: {
            type: "text",
            unique: true
        }
    },
    relations: {
        users: {
            target: "User",
            type: "many-to-many"
        }
    }
})