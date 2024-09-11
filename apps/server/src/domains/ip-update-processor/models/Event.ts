import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"


@Entity()
export class Event {

    @PrimaryGeneratedColumn("uuid")
    id: string



    @Column({ type: "int", unique: true })
    sequence: number

    @Column({ type: "text" })
    name: string

    @Column({ type: "text" })
    cid: string

    // @Column({ type: "text", transformer: { to: JSON.stringify, from: JSON.parse } })
    @Column("simple-json")
    data: object

    @Column({ type: "boolean" })
    published: boolean



    @CreateDateColumn()
    createAt: Date
    
}