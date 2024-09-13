import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { User } from "./User"


@Entity()
export class Password {

    @PrimaryGeneratedColumn('uuid')
    id: string



    @OneToOne(() => User, user => user.password)
    user: User

    @Column({ type: "text" })
    hash: string

    @Column({ type: "text" })
    salt: string



    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date

}