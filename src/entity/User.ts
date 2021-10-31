import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Url } from "./Url";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string

    @Column('varchar')
    password: string

    @OneToMany(() => Url, url => url.user)
    urls: Url[]

}
