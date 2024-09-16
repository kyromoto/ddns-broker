import { User } from "@server/domains/iam/models/User.model";
import { EntitySchema } from "typeorm";

export const UserSchema  = new EntitySchema<User>({
    name: "User",
    columns: {
        id: {
            type: "text",
            primary: true,
            generated: "uuid",
        },
        name: {
            type: "text",
            unique: true
        },
        password: {
            type: "simple-json"    
        },
        email: {
            type: "text",
            unique: true
        },
        createAt: {
            type: "text",
            createDate: true
        },
        updateAt: {
            type: "text",
            updateDate: true
        }
    },
    relations: {
        roles: {
            target: "Role",
            type: "many-to-many"
        }
    }
})