import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { z } from "zod"

import { Client } from "./Client"
import { Job } from "./Job"


@Entity()
export class ProcessorConfig {

    @PrimaryGeneratedColumn("uuid")
    id: string



    @Column({ type: "text" })
    name: string

    @Column({ type: "text" })
    version: string

    @Column("simple-json")
    config: z.ZodTypeAny

    @ManyToOne(() => Client, client => client.processors)
    client: Client



    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date

}