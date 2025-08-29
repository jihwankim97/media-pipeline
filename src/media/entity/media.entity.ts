import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from 'src/common/entity/base-table.entity';
import { MediaDetail } from './media.detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';

@Entity()
export class Media extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  title: string;

  @ManyToMany(() => Genre, (genre) => genre.medias, {
    nullable: false,
    cascade: true,
  })
  @JoinTable()
  genres: Genre[];

  @OneToOne(() => MediaDetail, (detail) => detail.media, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  detail: MediaDetail;

  @ManyToOne(() => Director, (director) => director.medias, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  director: Director;
}
