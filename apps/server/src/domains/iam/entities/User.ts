import { Column, CreateDateColumn, Entity, ManyToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Password } from "./Password";
import { Role } from "./Role";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string



    @Column({ type: "text" })
    username: string

    @OneToOne(() => Password, { cascade: true })
    password: Password

    @Column({ type: "text" })
    firstname: string

    @Column({ type: "text" })
    lastname: string

    @Column({ type: "text" })
    email: string

    @ManyToMany(() => Role, role => role.users)
    roles: Role[]



    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date

}