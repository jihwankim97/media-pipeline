import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from 'src/common/entity/base-table.entity';
import { MediaDetail } from './media.detail.entity';
import { Director } from 'src/director/entity/director.entity';

@Entity()
export class Media extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(() => MediaDetail, (detail) => detail.media, { cascade: true })
  @JoinColumn()
  detail: MediaDetail;

  @ManyToOne(() => Director, (director) => director.medias)
  director: Director;
}
