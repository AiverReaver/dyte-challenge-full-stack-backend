import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Url {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    actualUrl: string

    @Column()
    shortId: string

    @Column('varchar')
    shortUrl: string

    @Column("int", { default: 0 })
    visitors: number

}
