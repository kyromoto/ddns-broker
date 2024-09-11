import { CreateDateColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProcessorConfig } from "./Processors";
import { Job } from "./Job";



export class Client {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @OneToMany(() => Job, job => job.client)
    jobs: Job[]

    @OneToMany(() => ProcessorConfig, processor => processor.client)
    processors: ProcessorConfig[]



    @CreateDateColumn()
    createAt: Date
    
    @UpdateDateColumn()
    updateAt: Date

}