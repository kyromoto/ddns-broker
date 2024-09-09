import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Client } from "./Client"
import { Password } from "./Password"
import { generateHash } from "../utils";


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