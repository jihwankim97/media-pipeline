import { BaseTable } from 'src/common/entity/base-table.entity';
import { Media } from 'src/media/entity/media.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Director extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  dob: Date;

  @Column()
  nationality: string;

  @OneToMany(() => Media, (media) => media.director)
  medias: Media[];
}
