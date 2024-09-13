import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Client } from "./Client"
import { Password } from "./Password"
import { generateHash } from "../utils/password-util";


@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    

    @Column({ type: "text", unique: true })
    username: string;

    @OneToOne(() => Password, { cascade: true })
    @JoinColumn()
    password: Password

    @Column({ type: "text" })
    email: string;

    @Column({ type: "text" })
    firstName: string;
    
    @Column({ type: "text" })
    lastName: string;

    @OneToMany(() => Client, client => client.user, { cascade: true })
    clients: Client[]



    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date



    isCorrectPassword(password: string) {
        return this.password.hash === generateHash(password, this.password.salt)
    }

}



export function createUser (overrides: Partial<User> = {}) {

    const user = new User()

    user.username   = overrides.username    || user.username
    user.password   = overrides.password    || user.password
    user.email      = overrides.email       || user.email
    user.firstName  = overrides.firstName   || user.firstName
    user.lastName   = overrides.lastName    || user.lastName
    user.clients    = overrides.clients     || user.clients


    return user
}