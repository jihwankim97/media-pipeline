import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Media } from './media.entity';

@Entity()
export class MediaDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  detail: string;

  @OneToOne(() => Media, (media) => media.detail)
  media: Media;
}
