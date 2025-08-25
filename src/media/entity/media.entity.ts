import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTable } from './base-table.entity';
import { MediaDetail } from './media.detail.entity';

@Entity()
export class Media extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(() => MediaDetail, (detail) => detail.media)
  detail: MediaDetail;
}
