import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";


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