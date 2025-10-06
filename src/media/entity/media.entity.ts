import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from 'src/common/entity/base-table.entity';
import { MediaDetail } from './media.detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { Transform } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import { MediaUserLike } from './media-user-like.entity';

@Entity()
export class Media extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.medias)
  creator: User;

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

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  disLikeCount: number;

  @OneToOne(() => MediaDetail, (detail) => detail.media, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  detail: MediaDetail;

  @Column()
  @Transform(({ value }) =>
    process.env.ENV === 'prod'
      ? `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${value}`
      : `http://localhost:3000/${value}`,
  )
  mediaFilePath: string;

  @ManyToOne(() => Director, (director) => director.medias, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  director: Director;

  @OneToMany(() => MediaUserLike, (mul) => mul.media)
  likedUsers: MediaUserLike[];
}
