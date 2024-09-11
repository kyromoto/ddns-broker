import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm"
import { JobStatus } from "../types"
import { Client } from "./Client"

@Entity()
export class Job {

    @PrimaryGeneratedColumn("uuid")
    id: string



    @Column({ type: "text" })
    status: JobStatus

    @Column("simple-json")
    data: {
        ips: string[],
        processor: {
            id: string,
            name: string,
            version: string
        }
    }

    @ManyToOne(() => Client, client => client.jobs)
    client: Client


    
    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date

}