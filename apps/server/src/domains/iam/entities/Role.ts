import { Column, CreateDateColumn, Entity, ManyToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";



@Entity()
export class Role {

    @PrimaryGeneratedColumn('uuid')
    id: string

    

    @Column({ type: "text" })
    name: string

    @ManyToMany(() => User, user => user.roles)
    users: User[]



    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date

}