import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { JobStatus } from "../types"

@Entity()
export class Job {

    @PrimaryGeneratedColumn("uuid")
    id: string



    @Column({ type: "text" })
    label: string

    @Column({ type: "text" })
    status: JobStatus

    @Column({ type: "text", transformer: { to: JSON.stringify, from: JSON.parse } })
    data: Object


    
    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date

}