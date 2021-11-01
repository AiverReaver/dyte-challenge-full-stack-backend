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

    @Column('varchar')
    shortUrl: string;

    @Column("int", { default: 0 })
    visitors: number;

    @Column("int", { default: 0 })
    views: number;

    @ManyToOne(() => User, user => user.urls)
    user: User;

    @Column()
    lastDevice: string;

    @Column()
    lastBrowser: string;

}
