import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";
import { generatePasswordHashAndSalt } from "../utils/password-util";


@Entity()
export class Password {

    @PrimaryGeneratedColumn("uuid")
    id: string;


    @Column({ type: "text" })
    hash: string;

    @Column({ type: "text" })
    salt: string;



    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;

    @VersionColumn()
    version: number;
}



export function createPassword (overrides: Partial<Password> = {}) {

    const password = new Password()
    password.hash = overrides.hash || password.hash
    password.salt = overrides.salt || password.salt

    return password
}


export function createPasswordFromStr (password: string) {
    
    const { hash, salt } = generatePasswordHashAndSalt(password)
    
    const p = new Password()
    p.salt = salt
    p.hash = hash

    return p
}