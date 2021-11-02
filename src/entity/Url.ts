import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Url {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    actualUrl: string;

    @Column()
    shortId: string;

    @Column("int", { default: 0 })
    visitors: number;

    @Column("int", { default: 0 })
    views: number;

    @ManyToOne(() => User, user => user.urls)
    user: User;

    @Column({ default: "unknown" })
    lastDevice: string;

    @Column({ default: "unknown" })
    lastBrowser: string;

    @Column({ type: "date" })
    expiryDate: string

}
