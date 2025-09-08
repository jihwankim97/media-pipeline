import { BaseTable } from 'src/common/entity/base-table.entity';
import { Media } from 'src/media/entity/media.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Genre extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @ManyToMany(() => Media, (media) => media.genres)
  medias: Media[];
}
