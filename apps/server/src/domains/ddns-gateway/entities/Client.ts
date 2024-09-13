import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Password as Password } from "./Password"
import { generateHash } from "../utils/password-util";


@Entity()
@Index(["clientname", "user"], { unique: true })
export class Client {

    @PrimaryGeneratedColumn('uuid')
    id: string



    @Column({ type: "text" })
    clientname: string

    @OneToOne(() => Password, { cascade: true })
    @JoinColumn()
    password: Password

    @ManyToOne(() => User, user => user.clients)
    user: User



    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date


    isCorrectpassword(password: string) {
        return this.password.hash === generateHash(password, this.password.salt)
    }

}